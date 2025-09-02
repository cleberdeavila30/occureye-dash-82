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
    
    console.log('🔍 Debug CSV Headers:', headers);
    
    const parsedData = lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const record: any = {};
        
        if (index < 3) {
          console.log(`🔍 Debug linha ${index + 1} valores:`, values);
        }
        
        headers.forEach((header, headerIndex) => {
          const value = values[headerIndex] || '';
          
          switch(header) {
            case 'ANO':
            case 'PROTOCOLO':
              record[header] = value ? parseInt(value) || 0 : 0;
              break;
            case 'PRESOS':
              record[header] = value && value !== '' ? parseInt(value) || 0 : 0;
              if (index < 3 && value) {
                console.log(`🔍 Debug PRESOS linha ${index + 1}:`, value, '→', record[header]);
              }
              break;
            case 'PRISAO':
              record[header] = value;
              if (index < 3) {
                console.log(`🔍 Debug PRISAO linha ${index + 1}:`, value);
              }
              break;
            default:
              record[header] = value;
          }
        });
        
        return record as OcorrenciaRecord;
      })
      .filter(record => record.DATA && record.ANO);
    
    console.log('🔍 Debug Total registros parseados:', parsedData.length);
    console.log('🔍 Debug Primeiros 3 registros:', parsedData.slice(0, 3));
    
    return parsedData;
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