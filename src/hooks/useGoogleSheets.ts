import { useState, useEffect } from 'react';
import { OcorrenciaRecord } from '@/types/dashboard';

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1BjwY1o8ftiXNZz4JOhQGGCPfhE8KZogMGUIkPFScLW8/export?format=csv';

export const useGoogleSheets = () => {
  const [data, setData] = useState<OcorrenciaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (csvText: string): OcorrenciaRecord[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    console.log('🔍 Debug Headers CSV:', headers);
    console.log('🔍 Debug Total colunas:', headers.length);
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        
        if (index < 5) {
          console.log(`🔍 LINHA ${index + 1} - Total valores:`, values.length);
          console.log(`🔍 LINHA ${index + 1} - Linha bruta:`, line);
          console.log(`🔍 LINHA ${index + 1} - Todos valores:`, values);
          console.log(`🔍 LINHA ${index + 1} - PRISAO (pos 12):`, values[12]);
          console.log(`🔍 LINHA ${index + 1} - PRESOS (pos 14):`, values[14]);
        }
        
        // Parse da linha CSV considerando vírgulas dentro de aspas
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };
        
        const properValues = parseCSVLine(line);
        
        if (index < 3) {
          console.log(`🔍 LINHA ${index + 1} - Parse correto - Total:`, properValues.length);
          console.log(`🔍 LINHA ${index + 1} - Parse correto - Valores:`, properValues);
        }
        
        // Usar o parse correto para mapeamento
        const record: OcorrenciaRecord = {
          DATA: properValues[0] || '',
          ANO: properValues[1] ? parseInt(properValues[1]) || 0 : 0,
          HORA_DP: properValues[2] || '',
          HORA_CCONET: properValues[3] || '',
          TEMPO_OCORR: properValues[4] || '',
          PROTOCOLO: properValues[5] ? parseInt(properValues[5]) || 0 : 0,
          FATO_DP: properValues[6] || '',
          OCORRENCIA_GCM: properValues[7] || '',
          RUA: properValues[8] || '',
          BAIRRO: properValues[9] || '',
          LEL: properValues[10] || '',
          RESUMO: properValues[11] || '',
          PRISAO: properValues[12] || '',
          PREDIO: properValues[13] || '',
          PRESOS: properValues[14] ? parseInt(properValues[14]) || 0 : 0
        };
        
        if (index < 3) {
          console.log(`🔍 REGISTRO FINAL ${index + 1}:`, {
            'PRISAO': record.PRISAO,
            'PRESOS': record.PRESOS,
            'DATA': record.DATA,
            'ANO': record.ANO
          });
        }
        
        return record;
      })
      .filter(record => record.DATA && record.ANO);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(GOOGLE_SHEETS_URL);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da planilha');
      }
      
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      
      setData(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchData };
};