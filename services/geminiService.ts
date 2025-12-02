import { GoogleGenAI, Type } from "@google/genai";
import { ALLOWED_SCHOOLS, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

/**
 * Tenta reparar um JSON incompleto/cortado (comum quando o token limit é atingido).
 * Tenta fechar chaves e colchetes abertos.
 */
function repairTruncatedJson(jsonStr: string): string {
  let trimmed = jsonStr.trim();
  
  // Se terminou com uma string aberta, tenta fechar
  if (trimmed.match(/"[^"]*$/)) {
      trimmed += '"';
  }
  
  // Contagem básica de brackets
  const openBraces = (trimmed.match(/\{/g) || []).length;
  const closeBraces = (trimmed.match(/\}/g) || []).length;
  const openBrackets = (trimmed.match(/\[/g) || []).length;
  const closeBrackets = (trimmed.match(/\]/g) || []).length;

  for (let i = 0; i < (openBraces - closeBraces); i++) {
    trimmed += '}';
  }
  for (let i = 0; i < (openBrackets - closeBrackets); i++) {
    trimmed += ']';
  }

  // Tenta fechar o objeto raiz se necessário
  if (!trimmed.endsWith('}')) {
      trimmed += '}';
  }

  return trimmed;
}

/**
 * Identifica qual tipo de documento é o PDF com base em uma lista de opções.
 */
export const identifyDocumentType = async (
    file: File, 
    possibleDocuments: string[]
): Promise<string> => {
    const filePart = await fileToGenerativePart(file);
    
    // Passamos a lista para o modelo escolher
    const optionsText = possibleDocuments.join('\n');

    const prompt = `
      Analise este documento PDF.
      Sua tarefa é identificar a qual categoria ele pertence, baseado EXCLUSIVAMENTE nesta lista de opções válidas:
      
      ${optionsText}
      
      Se o documento não parecer com nenhum da lista, retorne "DESCONHECIDO".
      Se for um certificado de NR33, NR35, NR10, tente encontrar o match exato na lista.
      
      Retorne APENAS um JSON: { "identifiedType": "Nome Exato da Lista" }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [filePart, { text: prompt }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        identifiedType: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text || "{}";
        const json = JSON.parse(text);
        return json.identifiedType || "DESCONHECIDO";

    } catch (error) {
        console.error("Erro na identificação do documento:", error);
        return "DESCONHECIDO";
    }
};

export const analyzeCertificate = async (
  file: File, 
  criteriaText: string, 
  documentType: string
): Promise<AnalysisResult> => {
  
  const filePart = await fileToGenerativePart(file);

  // Limita o tamanho do texto de critérios para evitar confusão no modelo
  const sanitizedCriteria = criteriaText.substring(0, 5000);

  const prompt = `
    Analise este PDF de treinamento/certificado.
    TIPO DE DOCUMENTO IDENTIFICADO: ${documentType}
    ESCOLA VÁLIDAS: ${ALLOWED_SCHOOLS.join(', ')}.

    VERIFICAR ITENS:
    ${sanitizedCriteria}

    RETORNE APENAS JSON. SEM MARKDOWN.
    Campos:
    - schoolDetected: Escola encontrada (Ex: SENAI, VESTAS).
    - workerName: O NOME COMPLETO do aluno/colaborador identificado no certificado (Ex: "João da Silva").
    - overallStatus: "APPROVED" (se todos OK) ou "REJECTED".
    - criteriaResults: Lista de itens.
      - description: O item avaliado.
      - status: "OK" ou "NOK".
      - observation: OBRIGATÓRIO SER MUITO CURTO (MÁX 10 PALAVRAS).
        Ex: "Data: 10/10/2023", "Assinatura OK", "40 horas".
        NÃO COPIE TRECHOS DO PDF. APENAS DADOS.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
            filePart,
            { text: prompt }
        ]
      },
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                fileName: { type: Type.STRING },
                overallStatus: { type: Type.STRING },
                schoolDetected: { type: Type.STRING },
                workerName: { type: Type.STRING },
                criteriaResults: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            description: { type: Type.STRING },
                            status: { type: Type.STRING },
                            observation: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    let text = response.text || "";
    
    // Remove markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result: AnalysisResult;
    try {
        result = JSON.parse(text) as AnalysisResult;
    } catch (e) {
        console.warn("JSON inválido recebido, tentando reparar...", e);
        // Tenta reparar caso tenha cortado
        try {
            const repairedText = repairTruncatedJson(text);
            result = JSON.parse(repairedText) as AnalysisResult;
        } catch (e2) {
             throw new Error("Falha ao processar resposta da IA. O documento é muito complexo ou a resposta foi cortada.");
        }
    }
    
    // Fallbacks
    result.fileName = file.name;
    result.identifiedType = documentType; // Preenche com o tipo que passamos
    if (!result.criteriaResults) result.criteriaResults = [];
    
    return result;

  } catch (error: any) {
    console.error("Erro detalhado da análise Gemini:", error);
    if (error.message && error.message.includes('Unterminated string')) {
         throw new Error(`A resposta da IA foi muito longa e foi cortada. Tente analisar um documento por vez.`);
    }
    const errorMessage = error.message || JSON.stringify(error);
    throw new Error(`Erro na análise: ${errorMessage}`);
  }
};
