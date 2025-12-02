
import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { analyzeCertificate, identifyDocumentType } from './services/geminiService';
import { AnalysisType, AnalysisResult, COLABORADOR_RULES } from './types';
import { User, Wrench, Loader2, RefreshCw, ArrowLeft, Play } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // State
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);

  // Handlers
  const handleTypeSelect = (type: AnalysisType) => {
    setAnalysisType(type);
    setStep(2); 
  };

  const handleCertificateUpload = (files: File[]) => {
    if (files.length === 0) return;
    setCertificateFiles(files);
  };

  const handleStartAnalysis = async () => {
      if (certificateFiles.length === 0) return;
      setTotalFiles(certificateFiles.length);
      setStep(3);
      await processCertificates(certificateFiles);
  };

  const getAvailableDocuments = (): string[] => {
      if (!analysisType) return [];
      
      // Se for colaborador, usa a lista fixa de regras
      if (analysisType === AnalysisType.COLABORADOR) {
          return COLABORADOR_RULES.map(r => r.documento);
      }

      // Máquina/Equipamento temporariamente sem dados (Excel removido)
      return [];
  };

  const processCertificates = async (files: File[]) => {
    if (!analysisType) return;

    setLoading(true);
    setError(null);
    const newResults: AnalysisResult[] = [];
    
    // Obter lista de documentos possíveis para identificação
    const availableDocs = getAvailableDocuments();

    // Datas para validação
    const today = new Date();
    const todayStr = today.toLocaleDateString('pt-BR');
    
    // Calculadores de data
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const limitDate1YearStr = oneYearAgo.toLocaleDateString('pt-BR');

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    const limitDate2YearsStr = twoYearsAgo.toLocaleDateString('pt-BR');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const limitDate6MonthsStr = sixMonthsAgo.toLocaleDateString('pt-BR');

    try {
      const normalize = (s: string) => s.toLowerCase().trim();
      
      // Processa um arquivo por vez
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i + 1);
        const file = files[i];
        
        // 1. IDENTIFICAÇÃO: A IA descobre qual é o documento
        let identifiedDocName = "DESCONHECIDO";
        try {
            identifiedDocName = await identifyDocumentType(file, availableDocs);
        } catch (e) {
            console.warn("Falha na identificação, seguindo como desconhecido");
        }

        // Se não identificou, não tem como validar critérios específicos
        if (identifiedDocName === "DESCONHECIDO") {
            newResults.push({
                fileName: file.name,
                identifiedType: "Não identificado na lista",
                overallStatus: "REJECTED",
                criteriaResults: [{
                    id: 0,
                    description: "Identificação do Documento",
                    status: "NOK",
                    observation: "O documento não corresponde a nenhum item da lista de parametrização."
                }]
            });
            continue;
        }

        // 2. BUSCA DE CRITÉRIOS: Busca na constante hardcoded
        let rule = null;
        if (analysisType === AnalysisType.COLABORADOR) {
            rule = COLABORADOR_RULES.find(r => normalize(r.documento) === normalize(identifiedDocName));
        }

        if (!rule) {
            newResults.push({
                fileName: file.name,
                identifiedType: identifiedDocName,
                overallStatus: "REJECTED",
                criteriaResults: [{
                    id: 0,
                    description: "Parametrização Ausente",
                    status: "NOK",
                    observation: `O documento "${identifiedDocName}" foi identificado, mas não foi encontrada regra correspondente.`
                }]
            });
            continue;
        }

        let combinedCriteria = rule.criterios;
        const validityRule = rule.vencimento;
        const docNameLower = normalize(identifiedDocName);

        // --- LÓGICA DINÂMICA DE DATAS BASEADA NA COLUNA VENCIMENTO ---
        
        // Determina se é validade Anual, Bienal, etc com base na string VENCIMENTO
        const vLower = validityRule.toLowerCase();
        let validityPrompt = "";

        // Regra especial NR33: 1 Ano (Anual) + Supervisor
        if (docNameLower.includes("nr33") || docNameLower.includes("nr 33")) {
             let hoursRequirement = "FORMAÇÃO/INICIAL (40h) ou RECICLAGEM (08h)";
             validityPrompt = `
            ALERTA DE DOCUMENTO NR33 - REQUISITOS OBRIGATÓRIOS:
            1. Nome e Assinatura do Trabalhador: EXTRAIA O NOME COMPLETO.
            2. Conteúdo Programático: Deve estar presente.
            3. Carga Horária: ${hoursRequirement}.
            4. Data e Validade (ANUAL / 1 ANO):
                - Data Referência: ${todayStr}
                - Data Limite (1 ano atrás): ${limitDate1YearStr}
                - COMPARE a data do curso com ${limitDate1YearStr}.
                - Se anterior: VENCIDO (NOK). Se posterior: VÁLIDO (OK).
                - Obs: "Data: DD/MM/AAAA - Status: [Válido/Vencido]".
            5. Local de Realização: Identifique.
            6. Nome e Assinatura do Instrutor: EXTRAIA NOME e FUNÇÃO.
            7. Assinatura do Responsável Técnico: EXTRAIA NOME.
             `;
        }
        else if (vLower.includes("bienal") || vLower.includes("2 anos")) {
             validityPrompt = `
            ALERTA VALIDADE BIENAL (2 ANOS) - REQUISITOS OBRIGATÓRIOS:
            1. Nome e Assinatura do Trabalhador.
            2. Conteúdo Programático.
            3. Data e Validade (2 ANOS):
                - Data Referência: ${todayStr}
                - Data Limite (2 anos atrás): ${limitDate2YearsStr}
                - COMPARE a data do curso com ${limitDate2YearsStr}.
                - Se data curso < ${limitDate2YearsStr} -> STATUS: VENCIDO (NOK).
                - Se data curso >= ${limitDate2YearsStr} -> STATUS: VÁLIDO (OK).
                - Obs: "Data: DD/MM/AAAA - Status: [Válido/Vencido]".
            `;
        }
        else if (vLower.includes("anual") || vLower.includes("1 ano")) {
             validityPrompt = `
            ALERTA VALIDADE ANUAL (1 ANO) - REQUISITOS OBRIGATÓRIOS:
            1. Nome e Assinatura do Trabalhador.
            2. Conteúdo Programático.
            3. Data e Validade (1 ANO):
                - Data Referência: ${todayStr}
                - Data Limite (1 ano atrás): ${limitDate1YearStr}
                - COMPARE a data do curso com ${limitDate1YearStr}.
                - Se data curso < ${limitDate1YearStr} -> STATUS: VENCIDO (NOK).
                - Se data curso >= ${limitDate1YearStr} -> STATUS: VÁLIDO (OK).
                - Obs: "Data: DD/MM/AAAA - Status: [Válido/Vencido]".
            `;
        }
        else if (vLower.includes("6 meses")) {
             validityPrompt = `
            ALERTA VALIDADE SEMESTRAL (6 MESES) - REQUISITOS OBRIGATÓRIOS:
            1. Nome e Assinatura do Trabalhador.
            2. Data e Validade (6 MESES):
                - Data Referência: ${todayStr}
                - Data Limite (6 meses atrás): ${limitDate6MonthsStr}
                - COMPARE a data do documento com ${limitDate6MonthsStr}.
                - Se data < ${limitDate6MonthsStr} -> STATUS: VENCIDO (NOK).
                - Se data >= ${limitDate6MonthsStr} -> STATUS: VÁLIDO (OK).
            `;
        }
        else if (vLower.includes("validade do documento") || vLower.includes("vencimento")) {
             validityPrompt = `
            ALERTA: VERIFIQUE A DATA DE VALIDADE IMPRESSA NO DOCUMENTO.
            Data de hoje: ${todayStr}.
            Se a data de validade/vencimento impressa for anterior a hoje, está VENCIDO (NOK).
            `;
        } 
        else {
             // Caso genérico ou "Não expira"
             validityPrompt = `
             Regra de Vencimento informada: "${validityRule}".
             Verifique se o documento atende a essa regra. Se for "Não expira" ou "-", a data é informativa (OK).
             `;
        }

        combinedCriteria += "\n\n" + validityPrompt;

        // 3. ANÁLISE FINAL
        const result = await analyzeCertificate(file, combinedCriteria, identifiedDocName);
        newResults.push(result);
      }
      
      setResults(newResults);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro durante a análise dos certificados");
    } finally {
      setLoading(false);
      setCurrentFileIndex(0);
    }
  };

  const handleBack = () => {
    setError(null);
    
    if (step === 2) {
      setAnalysisType(null);
      setCertificateFiles([]); 
    } else if (step === 3) {
      setResults([]);
      setStep(2); 
      return; 
    }
    setStep((prev) => Math.max(1, prev - 1));
  };

  const resetApp = () => {
    setStep(1);
    setAnalysisType(null);
    setCertificateFiles([]);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <User className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Verificador de Certificados IA
            </h1>
          </div>
          {step > 1 && (
            <button 
              onClick={resetApp}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reiniciar Tudo
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Button */}
        {step > 1 && (
            <div className="mb-4">
                <button 
                    onClick={handleBack}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar
                </button>
            </div>
        )}

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Tipo</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Upload</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Análise</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-fadeIn">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                </div> 
                <span>{error}</span>
            </div>
        )}

        {/* STEP 1: Select Type */}
        {step === 1 && (
           <div className="animate-fadeIn space-y-6">
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">O que vamos analisar?</h2>
                <p className="text-gray-500">Selecione o contexto da validação.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleTypeSelect(AnalysisType.COLABORADOR)}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent hover:border-blue-500 shadow-md rounded-2xl transition-all group"
                >
                    <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
                        <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800">Colaborador</span>
                    <span className="text-sm text-gray-500 mt-2">Validação de pessoas e treinamentos</span>
                </button>

                <div
                    className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-transparent rounded-2xl opacity-60 cursor-not-allowed"
                >
                    <div className="bg-gray-200 p-4 rounded-full mb-4">
                        <Wrench className="w-10 h-10 text-gray-400" />
                    </div>
                    <span className="text-xl font-semibold text-gray-500">Máquina | Equipamento</span>
                    <span className="text-sm text-gray-400 mt-2">Indisponível no momento</span>
                </div>
             </div>
           </div>
        )}

        {/* STEP 2 & 3: Upload PDF & Results */}
        {(step === 2 || step === 3) && (
            <div className="animate-fadeIn space-y-8">
                 {step === 2 && (
                    <>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Anexar Documentos</h2>
                            <p className="text-gray-500">Envie os PDFs. A IA identificará o tipo automaticamente.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <FileUpload 
                                accept="application/pdf" 
                                multiple={true}
                                label="Arraste os certificados PDF aqui" 
                                description="Você pode enviar múltiplos arquivos de uma vez"
                                onFilesSelected={handleCertificateUpload} 
                            />
                            
                            {certificateFiles.length > 0 && (
                                <button 
                                    onClick={handleStartAnalysis}
                                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>Verificar ({certificateFiles.length} arquivos)</span>
                                </button>
                            )}
                        </div>
                    </>
                 )}

                 {step === 3 && loading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Analisando documentos com IA...</h3>
                        <p className="text-gray-500 text-sm">
                            Processando arquivo {currentFileIndex} de {totalFiles}
                        </p>
                        <p className="text-gray-400 text-xs">Identificando documento e validando critérios...</p>
                    </div>
                 )}

                 {step === 3 && !loading && results.length > 0 && (
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Resultados da Análise</h2>
                            <button 
                                onClick={() => setStep(2)} 
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                Analisar outros arquivos
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {results.map((res, idx) => (
                                <ResultCard key={idx} result={res} />
                            ))}
                        </div>
                     </div>
                 )}
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
