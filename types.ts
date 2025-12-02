export enum AnalysisType {
  COLABORADOR = 'Colaborador',
  EQUIPAMENTO = 'Equipamento'
}

export interface ExcelRow {
  documento: string; // Column A
  criterios: string; // Column C
}

export interface ExcelData {
  empregado: ExcelRow[];
  equipamento: ExcelRow[];
}

export interface CriterionResult {
  id: number;
  description: string;
  status: 'OK' | 'NOK';
  observation: string;
}

export interface AnalysisResult {
  fileName: string;
  identifiedType?: string; // Novo campo para o documento identificado automaticamente
  overallStatus: 'APPROVED' | 'REJECTED';
  criteriaResults: CriterionResult[];
  schoolDetected?: string;
}

export const ALLOWED_SCHOOLS = [
  "TASK", 
  "SENAI", 
  "PROALTITUDE", 
  "MAERSK", 
  "STORZ", 
  "PREVENT WORK", 
  "CT Profissional", 
  "CTAR"
];

export const DEFAULT_COLABORADOR_DOCS = [
  "Identificação Pessoal",
  "Cartão de Vacina",
  "Cartão do SUS",
  "Formação Profissional + Conselho de Classe",
  "Formação Específica",
  "Vínculo Empregatício",
  "ASO",
  "Plano de Saúde",
  "Registro de Integração no Campo",
  "SIT - Safety Introdution for Technicians",
  "Ordem de Serviço",
  "Ficha de Entrega do Equipamento de Proteção Individual - EPI",
  "Direção Defensiva - Formação/Reciclagem",
  "NR 10 - Certificado de Capacitação",
  "NR 10 - Carta de Anuência",
  "NR 10 SEP - Formação/reciclagem.",
  "NR 10 SEP - Carta de Anuência",
  "BTT - VESTAS",
  "BTT - Escola parceira",
  "NR 11 - Formação/Reciclagem.",
  "Cartão de Autorização de Uso de Veículo Industrial (NR11)",
  "NR 12 - Formação/Reciclagem",
  "NR 12 - Carta de Anuência",
  "NR 17",
  "NR33/Vigia e Trabalhador autorizado - Formação/reciclagem.",
  "NR33/Supervisor - Formação/reciclagem.",
  "Carta de Anuência - NR 33",
  "NR 35 - Formação/Reciclagem",
  "NR 35 - Carta de Anuência",
  "Lift User",
  "Inspetor Competente (EPI Altura) - Formação/Reciclagem",
  "Certificado de Operador de Elevador (ARTAMA A400 | USIMAQ | AVANTI | POWER CLIMBER)",
  "Certificado de Primeiros Socorros",
  "Certificado de Combate a Incêndio",
  "GWO/BST - Formação/Reciclagem.",
  "Inventário do material de acesso por corda",
  "Check list de inspeção de acesso por corda",
  "Certificado IRATA/ANEAC/ABENDI",
  "Checklist de Inspeção dos EPI's de altura",
  "ESO - Electrical Safety for Ordinary",
  "ESQ",
  "LOTO - Escola Parceira",
  "LOTO 2 - VESTAS",
  "SAI",
  "FPA",
  "HIGH VOLTAGE",
  "PT1 | PT2"
];