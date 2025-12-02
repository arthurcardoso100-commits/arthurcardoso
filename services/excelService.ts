import * as XLSX from 'xlsx';
import { ExcelData, ExcelRow } from '../types';

// Helper function to normalize strings (remove accents, lowercase) for easier comparison
const normalizeStr = (str: string) => {
  return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
};

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result: ExcelData = {
          empregado: [],
          equipamento: []
        };

        // Advanced heuristic to find the header row and columns based on content scoring
        const detectStructure = (jsonData: any[][]) => {
            let bestRow = -1;
            let bestScore = -1;
            
            // Defaults: Column A (0) for Document, Column C (2) for Criteria
            let bestDocIdx = 0;
            let bestCritIdx = 2;

            // Scan first 50 rows to find the most likely header row
            for (let r = 0; r < Math.min(jsonData.length, 50); r++) {
                const row = jsonData[r];
                if (!Array.isArray(row)) continue;
                
                let currentScore = 0;
                let tempDocIdx = -1;
                let tempCritIdx = -1;

                for (let c = 0; c < row.length; c++) {
                    const cellVal = normalizeStr(String(row[c]));
                    if (!cellVal) continue;

                    // High score for exact or strong matches
                    if (cellVal === 'documento' || cellVal === 'documentos') {
                        currentScore += 10;
                        tempDocIdx = c;
                    } else if (cellVal.includes('documento')) {
                        currentScore += 2;
                        if (tempDocIdx === -1) tempDocIdx = c;
                    }

                    if (cellVal.includes('criterio') || cellVal.includes('validacao') || cellVal.includes('requisito') || cellVal.includes('avaliacao')) {
                        currentScore += 5;
                        tempCritIdx = c;
                    }
                }

                // If this row looks more like a header than previous best, keep it
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestRow = r;
                    if (tempDocIdx !== -1) bestDocIdx = tempDocIdx;
                    if (tempCritIdx !== -1) bestCritIdx = tempCritIdx;
                }
            }
            
            // If we found a good header (score > 2), use its indices. 
            // If not, fallback to 0, 0, 2 (Row 0, Col A, Col C)
            if (bestScore >= 2) {
                 // If criteria column wasn't explicitly found, assume it's 2 columns after document (Standard A -> C layout)
                 if (bestCritIdx === -1) bestCritIdx = bestDocIdx + 2;
                 return { headerRow: bestRow, docIndex: bestDocIdx, critIndex: bestCritIdx };
            }

            return { headerRow: 0, docIndex: 0, critIndex: 2 };
        };

        const extractRows = (sheetName: string): ExcelRow[] => {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) return [];
            
            const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            if (!jsonData || jsonData.length === 0) return [];

            const structure = detectStructure(jsonData);
            
            // Start reading from the row AFTER the header
            const startRow = structure.headerRow + 1;

            return jsonData.slice(startRow)
                .map(row => {
                    const rawDoc = row[structure.docIndex];
                    const rawCrit = row[structure.critIndex];

                    return {
                        documento: rawDoc ? String(rawDoc).trim() : '', 
                        criterios: rawCrit ? String(rawCrit).trim() : ''  
                    };
                })
                .filter(r => {
                    const docLower = normalizeStr(r.documento);
                    // Filter out empty document names and repeated headers
                    const isHeader = docLower === 'documento' || docLower === 'documentos';
                    const hasDocName = r.documento.length > 0;
                    
                    // IMPORTANT: We do NOT filter by criteria length anymore. 
                    // This allows documents to appear in the list even if criteria column is empty or merged.
                    return !isHeader && hasDocName;
                });
        };

        const sheetNames = workbook.SheetNames;
        
        // Expanded search for Empregado tab (Empregado, Colaborador, Funcionario)
        const empregadoTabName = sheetNames.find(s => {
            const n = normalizeStr(s);
            return n.includes('empregado') || n.includes('colaborador') || n.includes('funcionario');
        });
        
        // Search for Maquina/Equipamento tab
        const maquinaTabName = sheetNames.find(s => {
            const n = normalizeStr(s);
            return n.includes('maquina') || n.includes('equipamento');
        });

        if (empregadoTabName) {
            result.empregado = extractRows(empregadoTabName);
            console.log(`Dados extraídos da aba ${empregadoTabName}: ${result.empregado.length} registros.`);
        }
        
        if (maquinaTabName) {
            result.equipamento = extractRows(maquinaTabName);
            console.log(`Dados extraídos da aba ${maquinaTabName}: ${result.equipamento.length} registros.`);
        }

        if (result.empregado.length === 0 && result.equipamento.length === 0) {
            reject(new Error("Nenhum dado encontrado. Verifique se o Excel possui abas 'Empregado' ou 'Máquina' e se a coluna 'Documento' (A) está preenchida."));
        } else {
            resolve(result);
        }

      } catch (error) {
        console.error(error);
        reject(new Error("Erro ao processar arquivo Excel."));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
