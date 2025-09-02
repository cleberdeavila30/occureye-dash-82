export interface OcorrenciaRecord {
  DATA: string;
  ANO: number;
  HORA_DP: string;
  HORA_CCONET: string;
  TEMPO_OCORR: string;
  PROTOCOLO: number;
  FATO_DP: string;
  OCORRENCIA_GCM: string;
  RUA: string;
  BAIRRO: string;
  LEL: string;
  RESUMO: string;
  PRISAO: string;
  PREDIO: string;
  PRESOS: number;
}

export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  ano?: number;
  bairro?: string;
  fato_dp?: string;
}

export interface KPIData {
  totalRegistros: number;
  totalPrisoes: number;
  totalPresos: number;
  comparativoAno: number;
}

export interface RankingItem {
  name: string;
  count: number;
  percentage: number;
}

export interface TimeAnalysis {
  turno: string;
  count: number;
  percentage: number;
}

export interface HourlyData {
  hour: number;
  count: number;
}