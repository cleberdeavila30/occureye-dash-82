import { useState, useEffect } from 'react';
import { OcorrenciaRecord } from '@/types/dashboard';

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1BjwY1o8ftiXNZz4JOhQGGCPfhE8KZogMGUIkPFScLW8/export?format=csv';

export const useGoogleSheets = () => {
  const [data, setData] = useState<OcorrenciaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (csvText: string): OcorrenciaRecord[] => {
    const lines = csvText.split('\n');
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        
        // Mapeamento correto baseado na posição real dos valores
        const record: OcorrenciaRecord = {
          DATA: values[0] || '',
          ANO: values[1] ? parseInt(values[1]) || 0 : 0,
          HORA_DP: values[2] || '',
          HORA_CCONET: values[3] || '',
          TEMPO_OCORR: values[4] || '',
          PROTOCOLO: values[5] ? parseInt(values[5]) || 0 : 0,
          FATO_DP: values[6] || '',
          OCORRENCIA_GCM: values[7] || '',
          RUA: values[8] || '',
          BAIRRO: values[9] || '',
          LEL: values[10] || '',
          RESUMO: values[11] || '',
          PRISAO: values[13] || '', // Posição correta para PRISAO
          PREDIO: values[14] || '', // Posição correta para PREDIO  
          PRESOS: values[15] ? parseInt(values[15]) || 0 : 0 // Posição correta para PRESOS
        };
        
        if (index < 3) {
          console.log(`🔍 Debug registro ${index + 1}:`, {
            PRISAO: record.PRISAO,
            PRESOS: record.PRESOS
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