
export enum AnalysisType {
  COLABORADOR = 'Colaborador',
  EQUIPAMENTO = 'Equipamento'
}

export interface ExcelRow {
  documento: string; 
  criterios: string; 
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
  identifiedType?: string;
  workerName?: string;
  overallStatus: 'APPROVED' | 'REJECTED';
  criteriaResults: CriterionResult[];
  schoolDetected?: string;
}

export interface DocumentRule {
  documento: string;
  vencimento: string;
  criterios: string;
}

export const ALLOWED_SCHOOLS = [
  "TASK", 
  "SENAI", 
  "PROALTITUDE", 
  "MAERSK", 
  "STORZ", 
  "PREVENT WORK", 
  "CT Profissional", 
  "CTAR",
  "VESTAS"
];

export const COLABORADOR_RULES: DocumentRule[] = [
  {
    documento: "Identificação Pessoal",
    vencimento: "CNH = Validade do documento\nRG + CPF = Não aplicável.",
    criterios: "CNH = Colaboradores Vestas\nCNH ou RG + CPF = Fornecedores Terceiros\nNota: Imagens infantis serão recusadas."
  },
  {
    documento: "Cartão de Vacina",
    vencimento: "-",
    criterios: "Esquema Vacinal completo, incluso prevenção contra COVID.\n\nNota: Esquema Vacinal - Hepatite B (03 doses); Febre Amarela (01 dose); DT - Difteria e Tétano (03 doses e reforço à cada 10 anos. 05 anos em caso de Ferimentos); Tríplice Viral (02 doses)."
  },
  {
    documento: "Cartão do SUS",
    vencimento: "-",
    criterios: "Nº do cartão e Nome do colaborador"
  },
  {
    documento: "Formação Profissional + Conselho de Classe",
    vencimento: "-",
    criterios: "Formação Profissional (Habilitação Profissional)\n01 - Certificado/Diploma de formação expedido por Instituição Oficial de Ensino.\n\nConselho de Classe\n - CFT/CRT = Téc. de O&M; Téc. de Blades\n - COREN = Técnico Enfermagem\n - MTE = Técnico Segurança\n - CREA = Engenheiro\n\nNota¹: Para os cargos Téc. de O&M/Téc. de Blades será aceito Formações Técnicas em Eletrotécnica, Eletromecânica, Mecânica, Mecatrônica ou equivalente.\nNota²: Para os cargos de Mecânico/Meio Oficial, poderá ser aceito como Formação Profissional o tempo de serviço equivalente à XX anos de atuação."
  },
  {
    documento: "Formação Específica",
    vencimento: "Validade do documento\n(02 Anos - Reparador de Blade;\n02 Anos - Piloto de Drone)",
    criterios: "01 - Certificado/Diploma expedido por Instituição Oficial de Ensino (Qualificação Profissional)\na) Identificação do equipamento (tipo, modelo, frota/Tag interna), quando aplicável;\nb) Conteúdo programático;\nc) Carga horária;\nd) Data;\ne) Local do treinamento;\nf)  Nome e assinatura do Aluno, Instrutor e Responsável Técnico.\ng) Documento legível, sem rasuras e em pdf.\n\n02 - Certificado expedido por Empregador (Capacitação Profissional)\na) Identificação do equipamento (tipo, modelo, frota/Tag interna), quando aplicável;\nb) Conteúdo programático;\nc) Carga horária;\nd) Data;\ne) Local do treinamento;\nf)  Nome e assinatura do Aluno, Instrutor e Responsável Técnico.\ng) Documento legível, sem rasuras e em pdf.\n\n - Conforme Equipamento: Para os cargos de Reparador Externo de Blade, Piloto de Drone, Operador de Guindaste/Munck\n - APH (Atendimento Pré-Hospitalar): Para os cargos de Téc de Enfermagem/Motorista de Ambulância\n - Condução de veículos de emergência: Para o cargo de Motorista de Ambulância\n - Operação de Empilhadeira: Para o cargo de Stockeeper\n - Sinaleiro: Para o cargo de Sinaleiro\n - Supervisor de Rigging: Para o cargo de Supervisor de Guindaste\n\n - conteúdo programático: NR18 - Anexo I/Quadro I/Alínea alíneas \"c\" e \"d\": https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-18-atualizada-2025-1.pdf\n - carga horária - Formação 120hs/ Reciclagem 16hs.\n - O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;"
  },
  {
    documento: "Vínculo Empregatício",
    vencimento: "-",
    criterios: "CTPS + Ficha de Registro\nNota: Dados do Empregado(a), Cargo, Data de admissão."
  },
  {
    documento: "ASO",
    vencimento: "Anual",
    criterios: "01 - O ASO deve conter no mínimo:\na) razão social e CNPJ ou CAEPF da organização;\nb) nome completo do empregado, o número de seu CPF e sua cargo/função (igual ao Contrato de trabalho, Ficha de Registro e CTPS);\nc) a descrição dos perigos ou fatores de risco identificados e classificados no PGR que necessitem de controle médico previsto no PCMSO, ou a sua inexistência;\nd) indicação e data de realização dos exames ocupacionais clínicos e complementares a que foi submetido o empregado;\ne) definição de apto ou inapto para a função do empregado;\nf) o nome e número de registro profissional do médico responsável pelo PCMSO, se houver;\ng) data, número de registro profissional e assinatura do médico que realizou o exame clínico.\nh) Aptidão específicas, quando aplicável (Trabalho em Altura, Espaço Confinado, Trabalho com Eletricidade Condução de Veículos);\ni) Documento legível, sem rasuras e em pdf.\n\nLink para NR 07 (Item 7.5.19.1 - alíneas \"a\" à \"g\" e Item 7.5.19.2):\nhttps://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-07-atualizada-2022-1.pdf\n\nNota¹: O CNPJ quando for colaborador Vestas, poderá ser diferente do cadastro no SerCAE, devido diversos CNPJs filiais;\nNota²: Para colaboradores Vestas, riscos indicados como \"BAIXO\" no PCMSO, não deve ser considerado no ASO;\nNota³: Desconsiderar promoções horizontais (Jr, Pl e Sr)"
  },
  {
    documento: "Plano de Saúde",
    vencimento: "",
    criterios: "01 - Dados do Colaborador\n01 - Vigência"
  },
  {
    documento: "Registro de Integração no Campo",
    vencimento: "Anual - Por Site.",
    criterios: "1. FR120/0108-2929;\n2. Título;\n3. Tipo de treinamento;\n4. Se houver acesso a turbina, identificá-la;\n5. Iniciais do multiplicador;\n6. Nome do participante;\n7. Empresa do participante;\n8. Assinatura do participante;\n9. Assinatura do multiplicador;\n10. Data e local."
  },
  {
    documento: "SIT - Safety Introdution for Technicians",
    vencimento: "Bienal para subcontratados / Não expira VESTAS",
    criterios: "01 - Nome e assinatura do colaborador;\n02 - Conteúdo programático;\n03 - Data de conclusão do treinamento;\n04 - Local de realização do treinamento;\n05 - Nome e assinatura dos Instrutores;\n06 - Nome e assinatura do responsável técnico\n07 - Documento legível, sem rasuras e em pdf.\n\nNota: Conteúdo Programático = Introdução, Treinamento, Plano de Resposta a Emergências (ERP) e Procedimentos, Relatório e investigação de incidentes, Proteção e Prevenção contra Incêndios, Código de Práticas Seguras, Clima extremo, Flora e Fauna, Equipamentos de Proteção Individual (EPI), Trabalho em altura, Espaço Confinado, Controle de Energia Perigosa, Segurança Elétrica, Gestão Química, Transporte de mercadorias perigosas, Proteção de máquinas, Máquinas, Ferramentas e Equipamentos, Veículos e Equipamentos Pesados, Segurança do empreiteiro/subcontratado, Indução/orientação do local e caixa de ferramentas."
  },
  {
    documento: "Ordem de Serviço",
    vencimento: "Mudança de Função",
    criterios: "01 - Nome e função do trabalhador;\n02 - As descrições das atividades desenvolvidas precisam estar de acordo com o PGR;\n03 - Riscos ocupacionais compatíveis com aqueles descritos no PGR /Inventário de risco, com a mesma nomenclatura;\n04 - Os equipamentos de proteção individuais (EPIs) compatíveis com aqueles indicados no PGR;\n05 - Documento deve estar datado (a data da emissão não poderá ser inferior à data da admissão);\n06 - Assinatura do trabalhador e do responsável do HSE;\n07 - Documento legível e sem rasuras;\n08 - Documento em PDF.\n\nNota: A função do colaborador deve estar igual ao Contrato de trabalho, Ficha de Registro ou CTPS. Desconsierar promoções horizontais (Jr, Pl e Sr)."
  },
  {
    documento: "Ficha de Entrega do Equipamento de Proteção Individual - EPI",
    vencimento: "6 meses",
    criterios: "01 - Nome e Função do Colaborador;\n02 - Descrição dos EPIs, número do CA e data de entrega;\n03 - O documento deve estar assinado e datado pelo trabalhador (termo de responsabilidade);\n04 - Documento legível e sem rasuras;\n05 - Documento em PDF.\n\nNota: Os EPIs presentes na ficha EPI devem estar em sinergia com os riscos presentes no PGR de acordo com o GHE."
  },
  {
    documento: "Direção Defensiva - Formação/Reciclagem",
    vencimento: "Bienal",
    criterios: "01 - Nome e assinatura do trabalhador;\n02 - Conteúdo programático descrito e distribuído nas modalidades de ensino, teórica e prática;\n03 - Carga horária formação - 08hs/reciclagem carga horária 08hs;\n04 - data;\n05 - Local de realização do treinamento;\n06 - Nome e qualificação dos instrutores;\n07 - Assinatura do responsável técnico do treinamento.\n08 - Documento legível e sem rasuras;\n09 - Documento em PDF.\n\nNota: O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades."
  },
  {
    documento: "NR 10 - Certificado de Capacitação",
    vencimento: "Bienal",
    criterios: "01 - Nome e assinatura do colaborador;\n02 - Conteúdo programático;\n03 - Carga Horária de 40 horas e Reciclagem carga horária 08hs;\n04 - Data e Local do treinamento;\n05 - Nome e Qualificação dos Instrutores;\n06 - Nome e Assinatura do Responsável Técnico\n07 - Documento legível, sem rasuras e em PDF.\n\nNota¹: Link para NR 10\nhttps://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-10.pdf\n\nNota²: Conteúdo Programático conforme Anexo III da NR10;\nNota³: O treinamento inicial deverá ser realizado antes do trabalhador iniciar suas atividades. O periódico será aceito mediante apresentação do certificado de formação Inicial.\nNota4: O treinamento deverá conter as modalidades de ensino teórica e prática;"
  },
  {
    documento: "NR 10 - Carta de Anuência",
    vencimento: "Mudança de Função",
    criterios: "1. Nome do colaborador;\n2. Autorização para trabalho em eletricidades (NR 10);\n3. A Anuência não deve ser emitida antes da conclusão da capacitação.;\n4. Data da emissão;\n5. Assinatura do representantes de HSE;\n6. Assinatura do representante da área de elétrica;\n7. Assinatura do trabalhador;\n8. Função do trabalhadorr;\n9. O documento deve descrever a abrangência e limitações da autorização para a excecução de trabalhos com eletricidade;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF."
  },
  {
    documento: "NR 10 SEP - Formação/reciclagem.",
    vencimento: "Bienal",
    criterios: "Ao término dos treinamentos inicial, periódico ou eventual, previstos nas NR (Item 1.7/Subitem 1.7.1.1 - Capacitação e treinamento em Segurança e Saúde no Trabalho): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-01-atualizada-2022.pdf\n1. nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. formação carga horária - 40hs/Reciclagem carga horária 08hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\n8. Conteúdo programático (Anexo III - NR10/ Curso Básico - Segurança em Instalações e Serviços com Eletricidade:\nhttps://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-10.pdf;\n\nObservações:\n9. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n10. O treinamento deverá conter as modalidades de ensino, teórica e prática;\n11. Certificado de reciclagem só será aceito mediante apresentação do certificado de formação;\n12. Documento legível;\n13. Documento sem rasuras;\n14. Documento em PDF."
  },
  {
    documento: "NR 10 SEP - Carta de Anuência",
    vencimento: "Mudança de Função",
    criterios: "1. Nome do colaborador;\n2. Autorização para trabalho em eletricidades (NR10/SEP);\n3. A Anuência não deve ser emitida antes da conclusão da capacitação.;\n4. Data da emissão;\n5. Assinatura do representantes de HSE;\n6. Assinatura do representante da área de elétrica;\n7. Assinatura do trabalhador;\n8. Função do trabalhador;\n9. O documento deve descrever a abrangência e limitações da autorização para a excecução de trabalhos com eletricidade;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF."
  },
  {
    documento: "BTT - VESTAS",
    vencimento: "Não possui reciclagem",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "BTT - Escola parceira",
    vencimento: "Não possui reciclagem",
    criterios: "O certificado deve conter o :\n1. nome do trabalhador;\n2. conteúdo programático - Definido pelo empregador.\n3. carga horária:\nCarga horária do Módulo de Elétrica: 8hs - Não possui Reciclagem;\nCarga horária doMódulo de Mecânica: 13hs - Não possui Reciclagem;\nCarga horária doMódulo de Hidráulica: 08 - Não possui Reciclagem;\n4. data;\n5. local de realização do treinamento;\n6.  nome e formação profissional do(s) instrutor(es);\n7.  nome e assinatura do responsável técnico.\n\nObservações:\n8. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n9. Documento legível;\n10. Documento sem rasuras;\n11. Documento em PDF"
  },
  {
    documento: "NR 11 - Formação/Reciclagem.",
    vencimento: "Bienal",
    criterios: "1. Nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. carga horária formação - 02hs/reciclagem carga horária 02hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\nObservações:\n8. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n9. Documento legível;\n10. Documento sem rasuras;\n11. Documento em PDF.\n12: Conteúdo programático deverá ser definido pelo empregador do trabalhador."
  },
  {
    documento: "Cartão de Autorização de Uso de Veículo Industrial (NR11)",
    vencimento: "Anual",
    criterios: "1. Nome em lugar visível;\n2. Fotografia em lugar visíviel.\n3. Autorização para uso de veículo industrial;\n4. Data do início da vigência/autoriação.\n5. Documento legível;\n6.Documento sem rasuras;\n7. Documento em PDF."
  },
  {
    documento: "NR 12 - Formação/Reciclagem",
    vencimento: "Bienal",
    criterios: "1. Nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. carga horária formação - 02hs/reciclagem carga horária 02hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n8. Conteúdo programático: Anexo II da NR12:\nhttps://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-12-atualizada-2022-1.pdf\n\nObservações:\n8. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n9. Documento legível;\n10. Documento sem rasuras;\n11. Documento em PDF."
  },
  {
    documento: "NR 12 - Carta de Anuência",
    vencimento: "Mudança de Função",
    criterios: "1. Nome do colaborador;\n2. Autorização para trabalho em segurança do trabalho em máquinas e equipamentos (NR12);\n3. A Anuência não deve ser emitida antes da conclusão da capacitação.;\n4. Data da emissão;\n5. Assinatura do representantes de HSE;\n6. Assinatura do trabalhador;\n7. Função do colaborador;\n8. Documento legível;\n9. Documento sem rasuras;\n10. Documento em PDF."
  },
  {
    documento: "NR 17",
    vencimento: "-",
    criterios: "Obs: Certificação GWO contempla"
  },
  {
    documento: "NR33/Supervisor - Formação/reciclagem.",
    vencimento: "Anual",
    criterios: "Ao término dos treinamentos inicial, periódico ou eventual, previstos nas NR (Item 1.7/Subitem 1.7.1.1 - Capacitação e treinamento em Segurança e Saúde no Trabalho): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-01-atualizada-2022.pdf\n1. nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. carga horária formação - 40hs/Reciclagem carga horária 08hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\n8. Conteúdo programático (Quadro I - NR33/Capacitação de Vigia e Trabalhador autorizado  - https): www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-33-atualizada-2022-_retificada.pdf\n\nObservações:\n9. O treinamento inicial deve ocorrer antes de o trabalhador iniciar suas atividades;\n10. O treinamento deverá conter as modalidades de ensino, teórica e prática;\n11. Certificado de reciclagem só será aceito mediante apresentação do certificado de formação;\n12. Documento legível;\n13. Documento sem rasuras;\n14. Documento em PDF.\n15. Só serão permitidos certificados das escolas homologadas pela Vestas: TASK, SENAI, PROALTITUDE, MAERSK, STORZ, PREVENT WORK, CT Profissional e CTAR."
  },
  {
    documento: "Carta de Anuência - NR 33",
    vencimento: "Anual",
    criterios: "1. Nome do colaborador;\n2. Autorização para trabalho em espaços confinados (NR33);\n3. A Anuência não deve ser emitida antes da conclusão da capacitação.;\n4. Data da emissão;\n5. Assinatura do representantes de HSE;\n6. Assinatura do trabalhador;\n7. Função do colaborador;\n8. Documento legível;\n9. Documento sem rasuras;\n10. Documento em PDF."
  },
  {
    documento: "NR 35 - Formação/Reciclagem",
    vencimento: "-",
    criterios: "-"
  },
  {
    documento: "NR 35 - Carta de Anuência",
    vencimento: "Mudança de Função",
    criterios: "1. Nome do colaborador;\n2. Autorização para trabalho em altura (NR35);\n3. A Anuência não deve ser emitidau antes da conclusão da capacitação.;\n4. Data da emissão;\n5. Assinatura do representantes de HSE;\n6. Assinatura do trabalhador;\n7. Função do trabalhador;\n8. Documento legível;\n9. Documento sem rasuras;\n10. Documento em PDF."
  },
  {
    documento: "Lift User",
    vencimento: "Não expira VESTAS",
    criterios: "1. Nome e assinatura do colaborador;\n2. Conteúdo programático;\n3. Data de conclusão do treinamento;\n4. Local de realização do treinamento;\n5. Nome e qualificação dos Instrutores;\n6. Nome e assinatura do responsável técnico\n7. Documento legível;\n8. Documento sem rasuras;\n9. Documento em PDF."
  },
  {
    documento: "Inspetor Competente (EPI Altura) - Formação/Reciclagem",
    vencimento: "Bienal",
    criterios: "1. Nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. carga horária formação - 16hs/reciclagem carga horária 16hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\nObservações:\n9. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF."
  },
  {
    documento: "Certificado de Operador de Elevador (ARTAMA A400 | USIMAQ | AVANTI | POWER CLIMBER)",
    vencimento: "Anual",
    criterios: "1. Nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. carga horária formação - 16hs/Reciclagem carga horária 16hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\nObservações:\n9. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF.\n\nOBS: Para a plataforma AVANTI. Considerar apenas o certificado expedido pela AVANTI."
  },
  {
    documento: "Certificado de Primeiros Socorros",
    vencimento: "Bienal",
    criterios: "O certificado deve conter o :\n1. nome do trabalhador;\n2. conteúdo programático - Definido pelo empregador.\n3. carga horária - 04hs/Reciclagem carga horária 04hs;\n4. diária e total;\n5. data;\n6. local;\n7.  nome e formação profissional do(s) instrutor(es);\n8.  nome e assinatura do responsável técnico ou do responsável pela organização técnica do curso.\n\nObservações:\n9. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF"
  },
  {
    documento: "Certificado de Combate a Incêndio",
    vencimento: "Bienal",
    criterios: "O certificado deve conter o :\n1. nome do trabalhador;\n2. conteúdo programático - Definido pelo empregador.\n3. carga horária - 08hs/Reciclagem carga horária 08hs;\n4. data;\n5. local de realização do treinamento;\n6.  nome e formação profissional do(s) instrutor(es);\n7.  nome e assinatura do responsável técnico.\n\nObservações:\n8. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n9. Documento legível;\n10. Documento sem rasuras;\n11. Documento em PDF"
  },
  {
    documento: "GWO/BST - Formação/Reciclagem.",
    vencimento: "Bienal",
    criterios: "Certificado GWO\n1. Nome do colaborador;\n2. Número WINDA do colaborador - Consultar: https://winda.globalwindsafety.org/account/\n3. Número WINDA de Escola - Consultar: https://winda.globalwindsafety.org/account/\n4. Módulos Realizados (Trabalho em Altura / Primeiro Socorros / Combata a Incêndio / Movimentação de Cargas)\n5. Data de Realização do Treinamento.\nCarga horária formação - 32h\nCarga horária reciclagem - 24h\n\nCertificados dos Módulos - Trabalho em Altura NR35 / Primeiros Socorros / Combate a Incêndio / Movimentação de Cargas\nTodos os certificados de cada módulo deve constar:\n1. Nome e assinatura do colaborador;\n2. Conteúdo programático;\n4. Data de conclusão do treinamento;\n5. Local de realizaçãodo treinamento;\n6. Nome e Qualificação dos Instrutores;\n7. Número WINDA de Escola - Consultar: https://winda.globalwindsafety.org/account/;\n8. Número WINDA do colaborador - Consultar: https://winda.globalwindsafety.org/account/.\nTodos os certificados deverão constar as informações de acordo com a NR01(Item 1.7/Subitem 1.7.1.1) - Capacitação e treinamento em Segurança e Saúde no Trabalho): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-01-atualizada-2022.pdf\n9. O certificado do módulo de trabalho em altura deverá citar a NR35.\nCarga Horária dos Módulos:\nCarga horária - Trabalho em Altura: Formação - 16h / Reciclagem - 08h;\nCarga horária - Primeiros Socorros: Formação - 8h / Reciclagem - 04h;\nCarga horária - Combate a Incendio: Formação - 04h / Reciclagem - 04h;\nCarga horária - Movimentação de Cargas: Formação - 04h / Reciclagem - 04h;\n\nObservações:\n1. O treinamento inicial deve ocorrer antes de o trabalhador iniciar suas atividades;\n2. O treinamento deverá conter as modalidades de ensino, teórica e prática;\n3. Certificado de reciclagem só será aceito mediante apresentação do certificado de formação;\n4. Documento legível;\n5. Documento sem rasuras;\n6. Documento em PDF.\n7. Só serão permitidos certificados das escolas homologadas pela GWO - Global Wind Organization."
  },
  {
    documento: "Inventário do material de acesso por corda",
    vencimento: "N/A",
    criterios: "1. Lista dos materiais que o colaborador irá utilizar\n2. A lista deve estar nominal ao colaborador"
  },
  {
    documento: "Check list de inspeção de acesso por corda",
    vencimento: "1 ano",
    criterios: "1. Check list infrmando que a corda está apta para ser utilizada\n2. Deve estar assinado pelo responsável de quem realizou o check list"
  },
  {
    documento: "Certificado IRATA/ANEAC/ABENDI",
    vencimento: "Definida pela vigência da certificação",
    criterios: "1. Verificar no site da empresa certificadora:\n\n1.1. IRATA/https://www.iratabrasil.org.br/\n1.2. ANEAC/https://aneac.com.br/\n1.3. ABENDI/https://www1.abendi.org.br/certficacao/acesso-por-corda/\n\n2. Verificar validade da certificação."
  },
  {
    documento: "Checklist de Inspeção dos EPI's de altura",
    vencimento: "Anual",
    criterios: "1. Nome ou Iniciais do colaborador;\n2. Nome e assinatura do inspetor;\n2. Data da Inspeção;\n3. Fabricante;\n4. Modelo;\n5. Número de série;\n6. Número do Lote;\n7. Para o kit Avanti - Aceitar apenas o certificado de inspeção do trava quedas emitido pela Avanti. Caso o kit tenha menos de 1 ano de fabricação, poderá apresentar a Nota Fiscal de compra, substituindo o Certificado de Inspeção;\n8. Validar as informações do modelo e número de série com a Ficha de EPI;\n9. Documento legível\n10. Documento sem rasuras;\n11. Documento em PDF.\n\nOBS¹: Todos os itens devem seguir o padrão de análise conforme descrito a cima (cinturão tipo paraquedista, talabarte em \"y\", corda de posicionamento e trava quedas);\n\nOBS²: O cinturão tipo paraquedista, talabarte em \"y\", corda de posicionamento e trava quedas, devem pertencer ao mesmo fabricante.\n\nOBS³: Atenção! Os Projetos possuem plataformas distintas. Sendo assim, os cintos e seus elementos de conexão podem variar."
  },
  {
    documento: "ESO - Electrical Safety for Ordinary",
    vencimento: "Bienal para subcontratados / Não expira VESTAS",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "ESQ",
    vencimento: "Bienal",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "LOTO - Escola Parceira",
    vencimento: "Anual",
    criterios: "1. Nome e assinatura do trabalhador;\n2. conteúdo programático - Definido pelo empregador;\n3. carga horária formação - 08hs/reciclagem carga horária 08hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\nObservações:\n9. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF."
  },
  {
    documento: "LOTO 2 - VESTAS",
    vencimento: "Bienal",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "SAI",
    vencimento: "Não expira VESTAS",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "FPA",
    vencimento: "Bienal",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "HIGH VOLTAGE",
    vencimento: "Não expira VESTAS",
    criterios: "1. Nome do Colaborador;\n2. Documento legível;\n3. Documento sem rasuras;\n4. Documento em PDF."
  },
  {
    documento: "PT1 | PT2",
    vencimento: "Bienal",
    criterios: "1. Nome e assinatura do trabalhador;\n2. conteúdo programático;\n3. carga horária formação - 02hs/reciclagem carga horária 02hs;\n4. data;\n5. local de realização do treinamento;\n6. nome e qualificação dos instrutores;\n7. assinatura do responsável técnico do treinamento.\n\nObservações:\n9. O treinamento inicial deve ocorrer antes do trabalhador iniciar suas atividades;\n10. Documento legível;\n11. Documento sem rasuras;\n12. Documento em PDF."
  }
];
