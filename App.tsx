import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { parseExcelFile } from './services/excelService';
import { analyzeCertificate, identifyDocumentType } from './services/geminiService';
import { ExcelData, AnalysisType, AnalysisResult, DEFAULT_COLABORADOR_DOCS } from './types';
import { FileSpreadsheet, User, Wrench, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // State
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);

  // Handlers
  const handleExcelUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parseExcelFile(files[0]);
      setExcelData(data);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ler arquivo Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: AnalysisType) => {
    setAnalysisType(type);
    // Pula a etapa de seleção de documento e vai direto para upload
    setStep(3); 
  };

  const handleCertificateUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setCertificateFiles(files);
    setTotalFiles(files.length);
    setStep(4);
    await processCertificates(files);
  };

  const getAvailableDocuments = (): string[] => {
      if (!analysisType) return [];
      
      // Se for colaborador, usa a lista fixa (mais confiável segundo o usuário)
      if (analysisType === AnalysisType.COLABORADOR) {
          return DEFAULT_COLABORADOR_DOCS;
      }

      // Se for equipamento, usa o Excel
      if (excelData) {
          const list = excelData.equipamento;
          return Array.from(new Set(list.map(r => r.documento)))
            .filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
      }
      return [];
  };

  const processCertificates = async (files: File[]) => {
    if (!excelData || !analysisType) return;

    setLoading(true);
    setError(null);
    const newResults: AnalysisResult[] = [];
    
    // Obter lista de documentos possíveis para identificação
    const availableDocs = getAvailableDocuments();

    // Datas para validação
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    
    const todayStr = today.toLocaleDateString('pt-BR');
    const limitDate2YearsStr = twoYearsAgo.toLocaleDateString('pt-BR');

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

        // 2. BUSCA DE CRITÉRIOS: Com o nome identificado, buscamos no Excel
        const rows = analysisType === AnalysisType.COLABORADOR ? excelData.empregado : excelData.equipamento;
        
        // Se for Colaborador e usarmos a lista default, pode ser que o Excel não tenha os critérios
        // Mas o código antigo já lidava com fallback genérico.
        // Tentamos achar no Excel pelo nome identificado
        const targetRows = rows.filter(r => normalize(r.documento) === normalize(identifiedDocName));

        // Remove duplicatas
        const uniqueCriteriaList = Array.from(new Set(
            targetRows
              .map(r => r.criterios)
              .filter(c => c && c.trim().length > 0)
        ));

        let combinedCriteria = uniqueCriteriaList.join('\n');

        // === REGRAS ESPECÍFICAS PARA NR33 (Aplicada baseada no nome identificado) ===
        if (normalize(identifiedDocName).includes("nr33") || normalize(identifiedDocName).includes("nr 33")) {
            combinedCriteria += `
            
            ALERTA DE DOCUMENTO NR33 - REQUISITOS OBRIGATÓRIOS ADICIONAIS:
            Por favor, verifique e liste individualmente os seguintes pontos cruciais para a NR33.
            Para os itens "OK", extraia o dado (ex: data, nome) na observação.

            1. Nome e Assinatura do Trabalhador:
                - Verifique a existência de nome e assinatura.
                - Na observação, EXTRAIA O NOME COMPLETO do trabalhador/aluno. Ex: "Aluno: João da Silva".
            2. Conteúdo Programático: Deve estar presente e compatível com a NR33 (Espaço Confinado/Vigia/Supervisor).
            3. Carga Horária: 
                - Se for FORMAÇÃO/INICIAL: Exige 40 horas.
                - Se for RECICLAGEM: Exige 08 horas.
            4. Data e Validade (Vencimento de 2 Anos):
                - Data de Referência (Hoje): ${todayStr}
                - Data Limite de Validade (2 anos atrás): ${limitDate2YearsStr}
                - COMPARE a data do certificado com a Data Limite.
                - Se a data do curso for ANTERIOR a ${limitDate2YearsStr} -> Status: VENCIDO (NOK).
                - Se a data do curso for POSTERIOR a ${limitDate2YearsStr} -> Status: VÁLIDO (OK).
                - Na observação coloque EXATAMENTE: "Data: DD/MM/AAAA - Status: [Válido/Vencido]".
            5. Local de Realização: Identifique onde o treinamento ocorreu (Na observação: "Local: [Nome do Local]").
            6. Nome e Assinatura do Instrutor:
                - Identifique o NOME legível e a FUNÇÃO/QUALIFICAÇÃO do instrutor.
                - Na observação coloque: "Instrutor: [Nome] - Função: [Qualificação]".
            7. Assinatura do Responsável Técnico: 
                - Verifique se há assinatura do RT.
                - Na observação, EXTRAIA O NOME do Responsável Técnico. Ex: "RT: Eng. Maria Souza".
            `;
        }

        // Fallback genérico
        if (!combinedCriteria.trim()) {
            combinedCriteria = `O documento foi identificado como "${identifiedDocName}".
            Verifique: Identificação, Assinaturas, Datas, Validade e Conteúdo pertinente.`;
        }

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
      setExcelData(null);
    } else if (step === 3) {
      setAnalysisType(null);
    } else if (step === 4) {
      setResults([]);
      setCertificateFiles([]);
    }
    setStep((prev) => Math.max(1, prev - 1));
  };

  const resetApp = () => {
    setStep(1);
    setExcelData(null);
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
                <FileSpreadsheet className="w-5 h-5 text-white" />
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
              Reiniciar
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
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Parametrização</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Tipo</span>
            {/* Step 3 agora é Upload/Análise direta */}
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Análise</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            {/* Ajuste da largura: 3 passos agora */}
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(step / 4) * 100}%` }}
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

        {/* STEP 1: Upload Excel */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Upload da Parametrização</h2>
              <p className="text-gray-500">Envie o arquivo Excel contendo as regras de validação.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <FileUpload 
                  accept=".xlsx, .xls" 
                  label="Arraste o arquivo Excel aqui" 
                  description="Ou clique para selecionar (formato .xlsx)"
                  onFilesSelected={handleExcelUpload} 
                />
            </div>
            {loading && (
                <div className="flex justify-center items-center text-blue-600 mt-4">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Lendo arquivo...</span>
                </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Type */}
        {step === 2 && (
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

                <button
                    onClick={() => handleTypeSelect(AnalysisType.EQUIPAMENTO)}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent hover:border-blue-500 shadow-md rounded-2xl transition-all group"
                >
                    <div className="bg-orange-50 p-4 rounded-full mb-4 group-hover:bg-orange-100 transition-colors">
                        <Wrench className="w-10 h-10 text-orange-600" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800">Máquina | Equipamento</span>
                    <span className="text-sm text-gray-500 mt-2">Validação técnica de equipamentos</span>
                </button>
             </div>
           </div>
        )}

        {/* STEP 3 & 4: Upload PDF & Results (Previously Step 4 & 5) */}
        {(step === 3 || step === 4) && (
            <div className="animate-fadeIn space-y-8">
                 {step === 3 && (
                    <>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Anexar Certificados</h2>
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
                        </div>
                    </>
                 )}

                 {step === 4 && loading && (
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

                 {step === 4 && !loading && results.length > 0 && (
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Resultados da Análise</h2>
                            <button 
                                onClick={() => setStep(3)} 
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