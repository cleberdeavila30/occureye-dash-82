import { useState, useMemo } from "react";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardFilters as FilterType } from "@/types/dashboard";
import { KPICard } from "@/components/dashboard/KPICard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { TurnoChart } from "@/components/dashboard/TurnoChart";
import { HourlyChart } from "@/components/dashboard/HourlyChart";
import { RankingTable } from "@/components/dashboard/RankingTable";
import { ResumoAnalysisCard } from "@/components/dashboard/ResumoAnalysisCard";
import { DynamicAnalysis } from "@/components/dashboard/DynamicAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Gavel, 
  Users, 
  TrendingUp, 
  RefreshCw,
  AlertTriangle,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { data, loading, error, refetch } = useGoogleSheets();
  const [filters, setFilters] = useState<FilterType>({});
  const { toast } = useToast();

  const {
    filteredData,
    kpis,
    turnos,
    hourlyData,
    fatosDPRanking,
    ocorrenciaGCMRanking,
    ruasRanking,
    bairrosData,
    resumoAnalysis
  } = useDashboardData(data, filters);

  const availableOptions = useMemo(() => {
    const years = [...new Set(data.map(r => r.ANO))].sort((a, b) => b - a);
    const bairros = [...new Set(data.map(r => r.BAIRRO).filter(Boolean))].sort();
    const fatos = [...new Set(data.map(r => r.FATO_DP).filter(Boolean))].sort();
    
    return { years, bairros, fatos };
  }, [data]);

  const hasActiveFilters = useMemo(() => {
    return !!(filters.startDate || filters.endDate || filters.ano || filters.bairro || filters.fato_dp);
  }, [filters]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Dados atualizados",
        description: "Os dados foram atualizados com sucesso.",
      });
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Carregando dados da planilha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Erro ao carregar dados</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard - Registros de Ocorrências DP
              </h1>
              <p className="text-muted-foreground">
                Análise em tempo real das ocorrências registradas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">
              {filteredData.length.toLocaleString('pt-BR')} registros
            </span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total de Registros"
            value={kpis.totalRegistros}
            icon={FileText}
            trend={{
              value: kpis.comparativoAno,
              label: "vs ano anterior"
            }}
            variant="info"
          />
          <KPICard
            title="Total de Prisões"
            value={kpis.totalPrisoes}
            icon={Gavel}
            variant="warning"
          />
          <KPICard
            title="Total de Presos"
            value={kpis.totalPresos}
            icon={Users}
            variant="destructive"
          />
          <KPICard
            title="Taxa de Prisão"
            value={`${kpis.totalRegistros > 0 ? ((kpis.totalPrisoes / kpis.totalRegistros) * 100).toFixed(1) : 0}%`}
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Análise Dinâmica */}
        <DynamicAnalysis
          filteredData={filteredData}
          allData={data}
          turnos={turnos}
          hourlyData={hourlyData}
          fatosDPRanking={fatosDPRanking}
          bairrosData={bairrosData}
          totalPrisoes={kpis.totalPrisoes}
          totalPresos={kpis.totalPresos}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <DashboardFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableYears={availableOptions.years}
              availableBairros={availableOptions.bairros}
              availableFatos={availableOptions.fatos}
            />
          </div>

          {/* Análise Temporal */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TurnoChart data={turnos} />
              <ResumoAnalysisCard data={resumoAnalysis} />
            </div>
            
            <HourlyChart data={hourlyData} />
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <RankingTable
            title="Top 10 - Fatos DP"
            data={fatosDPRanking}
          />
          <RankingTable
            title="Top 10 - Ocorrências GCM"
            data={ocorrenciaGCMRanking}
          />
          <RankingTable
            title="Top 10 - Ruas"
            data={ruasRanking}
          />
        </div>

        {/* Bairros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingTable
            title="Distribuição por Bairros"
            data={bairrosData}
            maxItems={15}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Estatístico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registros filtrados:</span>
                  <span className="font-medium">{filteredData.length.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bairros únicos:</span>
                  <span className="font-medium">{bairrosData.length.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipos de fatos:</span>
                  <span className="font-medium">{fatosDPRanking.length.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ruas diferentes:</span>
                  <span className="font-medium">{ruasRanking.length.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Dashboard em tempo real conectado com Google Sheets. 
                Última atualização: {new Date().toLocaleString('pt-BR')}. 
                Os dados são atualizados automaticamente a cada 5 minutos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
