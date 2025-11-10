import { useMemo } from 'react';
import { OcorrenciaRecord, DashboardFilters, KPIData, RankingItem, TimeAnalysis, HourlyData } from '@/types/dashboard';

export const useDashboardData = (data: OcorrenciaRecord[], filters: DashboardFilters) => {
  const filteredData = useMemo(() => {
    return data.filter(record => {
      if (filters.startDate && filters.endDate) {
        const recordDate = new Date(record.DATA.split('/').reverse().join('-'));
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        if (recordDate < start || recordDate > end) return false;
      }
      
      if (filters.ano && record.ANO !== filters.ano) return false;
      if (filters.bairro && record.BAIRRO !== filters.bairro) return false;
      if (filters.fato_dp && record.FATO_DP !== filters.fato_dp) return false;
      
      return true;
    });
  }, [data, filters]);

  const kpis = useMemo((): KPIData => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const currentYearData = filteredData.filter(r => r.ANO === currentYear);
    const lastYearData = data.filter(r => r.ANO === lastYear);
    
    const totalRegistros = filteredData.length;
    
    console.log('🔍 Debug KPIs - Total registros filtrados:', totalRegistros);
    
    // Debug detalhado para valores de PRISAO
    const allPrisaoValues = filteredData.map(r => r.PRISAO);
    const uniquePrisaoValues = [...new Set(allPrisaoValues)];
    console.log('🔍 Debug KPIs - Valores únicos PRISAO:', uniquePrisaoValues);
    console.log('🔍 Debug KPIs - Total de valores PRISAO:', allPrisaoValues.length);
    
    // Contagem detalhada de cada valor único
    const prisaoCount: Record<string, number> = {};
    allPrisaoValues.forEach(value => {
      const key = String(value || 'VAZIO').toUpperCase().trim();
      prisaoCount[key] = (prisaoCount[key] || 0) + 1;
    });
    console.log('🔍 Debug KPIs - Contagem por valor PRISAO:', prisaoCount);
    
    // Total de Prisões: conta apenas registros onde PRISAO = "SIM"
    const totalPrisoes = filteredData.filter(r => {
      if (!r.PRISAO) return false;
      const prisaoValue = String(r.PRISAO).toUpperCase().trim();
      return prisaoValue === 'SIM';
    }).length;
    
    console.log('🔍 Debug KPIs - Total prisões SIM calculado:', totalPrisoes);
    console.log('🔍 Debug KPIs - Exemplos PRISAO (primeiros 10):', filteredData.slice(0, 10).map(r => r.PRISAO));
    
    // Total de Presos: soma da coluna PRESOS
    const totalPresos = filteredData.reduce((sum, r) => {
      if (!r.PRESOS) return sum;
      const presosValue = typeof r.PRESOS === 'number' ? r.PRESOS : parseInt(String(r.PRESOS)) || 0;
      return sum + presosValue;
    }, 0);
    
    console.log('🔍 Debug KPIs - Total presos:', totalPresos);
    console.log('🔍 Debug KPIs - Exemplos PRESOS:', filteredData.slice(0, 5).map(r => r.PRESOS));
    
    const comparativoAno = lastYearData.length > 0 
      ? ((currentYearData.length - lastYearData.length) / lastYearData.length) * 100
      : 0;

    return {
      totalRegistros,
      totalPrisoes,
      totalPresos,
      comparativoAno
    };
  }, [filteredData, data]);

  const turnos = useMemo((): TimeAnalysis[] => {
    const turnoCount = { 'Manhã': 0, 'Tarde': 0, 'Noite': 0, 'Madrugada': 0 };
    
    filteredData.forEach(record => {
      if (record.HORA_DP) {
        const hour = parseInt(record.HORA_DP.split(':')[0]);
        if (hour >= 6 && hour < 12) turnoCount['Manhã']++;
        else if (hour >= 12 && hour < 18) turnoCount['Tarde']++;
        else if (hour >= 18 && hour < 24) turnoCount['Noite']++;
        else turnoCount['Madrugada']++;
      }
    });
    
    const total = Object.values(turnoCount).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(turnoCount).map(([turno, count]) => ({
      turno,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }, [filteredData]);

  const hourlyData = useMemo((): HourlyData[] => {
    const hourCount: Record<number, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hourCount[i] = 0;
    }
    
    filteredData.forEach(record => {
      if (record.HORA_DP) {
        const hour = parseInt(record.HORA_DP.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourCount[hour]++;
        }
      }
    });
    
    return Object.entries(hourCount).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    }));
  }, [filteredData]);

  const fatosDPRanking = useMemo((): RankingItem[] => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(record => {
      if (record.FATO_DP) {
        counts[record.FATO_DP] = (counts[record.FATO_DP] || 0) + 1;
      }
    });
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  const ocorrenciaGCMRanking = useMemo((): RankingItem[] => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(record => {
      if (record.OCORRENCIA_GCM) {
        counts[record.OCORRENCIA_GCM] = (counts[record.OCORRENCIA_GCM] || 0) + 1;
      }
    });
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  const ruasRanking = useMemo((): RankingItem[] => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(record => {
      if (record.RUA) {
        counts[record.RUA] = (counts[record.RUA] || 0) + 1;
      }
    });
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  const bairrosData = useMemo((): RankingItem[] => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(record => {
      if (record.BAIRRO) {
        counts[record.BAIRRO] = (counts[record.BAIRRO] || 0) + 1;
      }
    });
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const resumoAnalysis = useMemo(() => {
    const violenciaDomestica = filteredData.filter(r => 
      r.RESUMO?.toLowerCase().includes('violência doméstica') || 
      r.RESUMO?.toLowerCase().includes('violencia domestica') ||
      r.RESUMO?.toLowerCase().includes('lei maria da penha') ||
      r.RESUMO?.toLowerCase().includes('violencia') ||
      r.RESUMO?.toLowerCase().includes('agressao') ||
      r.RESUMO?.toLowerCase().includes('agressão')
    ).length;
    
    const foragidos = filteredData.filter(r => 
      r.RESUMO?.toLowerCase().includes('foragido') ||
      r.RESUMO?.toLowerCase().includes('procurado')
    ).length;
    
    const furtos = filteredData.filter(r => 
      r.RESUMO?.toLowerCase().includes('furto')
    ).length;
    
    const roubos = filteredData.filter(r => 
      r.RESUMO?.toLowerCase().includes('roubo')
    ).length;
    
    return {
      violenciaDomestica,
      foragidos,
      furtos,
      roubos
    };
  }, [filteredData]);

  return {
    filteredData,
    kpis,
    turnos,
    hourlyData,
    fatosDPRanking,
    ocorrenciaGCMRanking,
    ruasRanking,
    bairrosData,
    resumoAnalysis
  };
};