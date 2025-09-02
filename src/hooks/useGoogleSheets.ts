import { useState, useEffect } from 'react';
import { OcorrenciaRecord } from '@/types/dashboard';

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1BjwY1o8ftiXNZz4JOhQGGCPfhE8KZogMGUIkPFScLW8/export?format=csv';

export const useGoogleSheets = () => {
  const [data, setData] = useState<OcorrenciaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (csvText: string): OcorrenciaRecord[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim()).filter(h => h);
    
    console.log('Debug: Headers encontrados no CSV:', headers);
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const record: any = {};
        
        console.log('Debug: Primeira linha de valores:', values.slice(0, headers.length));
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          switch(header) {
            case 'ANO':
            case 'PROTOCOLO':
              record[header] = value ? parseInt(value) || 0 : 0;
              break;
            case 'PRESOS':
              record[header] = value && value !== '' ? parseInt(value) || 0 : 0;
              break;
            default:
              record[header] = value;
          }
        });
        
        return record as OcorrenciaRecord;
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