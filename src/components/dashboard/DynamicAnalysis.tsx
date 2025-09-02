import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from "lucide-react";
import { useMemo } from "react";
import { 
  OcorrenciaRecord, 
  RankingItem, 
  TimeAnalysis, 
  HourlyData 
} from "@/types/dashboard";

interface DynamicAnalysisProps {
  filteredData: OcorrenciaRecord[];
  allData: OcorrenciaRecord[];
  turnos: TimeAnalysis[];
  hourlyData: HourlyData[];
  fatosDPRanking: RankingItem[];
  bairrosData: RankingItem[];
  totalPrisoes: number;
  totalPresos: number;
  hasActiveFilters: boolean;
}

interface AnalysisInsight {
  id: string;
  title: string;
  description: string;
  value?: string;
  trend?: "up" | "down" | "stable";
  priority: "high" | "medium" | "low";
  icon: React.ElementType;
  color: "success" | "warning" | "destructive" | "info";
}

export const DynamicAnalysis = ({
  filteredData,
  allData,
  turnos,
  hourlyData,
  fatosDPRanking,
  bairrosData,
  totalPrisoes,
  totalPresos,
  hasActiveFilters
}: DynamicAnalysisProps) => {
  
  const insights = useMemo((): AnalysisInsight[] => {
    const analysisResults: AnalysisInsight[] = [];
    
    if (filteredData.length === 0) {
      return [{
        id: "no-data",
        title: "Sem Dados",
        description: "Nenhuma ocorrência encontrada para os filtros aplicados.",
        priority: "high",
        icon: AlertTriangle,
        color: "warning"
      }];
    }

    // 1. Análise de Volume
    const percentualDoTotal = allData.length > 0 
      ? (filteredData.length / allData.length) * 100 
      : 0;
    
    if (hasActiveFilters && percentualDoTotal < 100) {
      analysisResults.push({
        id: "volume",
        title: "Volume de Ocorrências",
        description: `Os filtros aplicados mostram ${filteredData.length.toLocaleString('pt-BR')} ocorrências, representando ${percentualDoTotal.toFixed(1)}% do total de registros.`,
        value: `${percentualDoTotal.toFixed(1)}%`,
        priority: "medium",
        icon: BarChart3,
        color: percentualDoTotal > 50 ? "info" : "warning"
      });
    }

    // 2. Análise do Horário Crítico
    const horarioCritico = hourlyData.reduce((max, current) => 
      current.count > max.count ? current : max, hourlyData[0]);
    
    if (horarioCritico && horarioCritico.count > 0) {
      const horarioFormatado = `${horarioCritico.hour.toString().padStart(2, '0')}:00`;
      const percentualHorario = (horarioCritico.count / filteredData.length) * 100;
      
      analysisResults.push({
        id: "horario-critico",
        title: "Horário de Maior Incidência",
        description: `O horário das ${horarioFormatado} concentra o maior número de ocorrências (${horarioCritico.count} registros - ${percentualHorario.toFixed(1)}% do total).`,
        value: horarioFormatado,
        priority: "high",
        icon: Clock,
        color: percentualHorario > 10 ? "destructive" : "warning"
      });
    }

    // 3. Análise do Turno Dominante
    const turnoDominante = turnos.reduce((max, current) => 
      current.count > max.count ? current : max, turnos[0]);
    
    if (turnoDominante && turnoDominante.count > 0) {
      analysisResults.push({
        id: "turno-dominante",
        title: `Turno de Maior Atividade: ${turnoDominante.turno}`,
        description: `O turno da ${turnoDominante.turno.toLowerCase()} registra ${turnoDominante.count} ocorrências (${turnoDominante.percentage.toFixed(1)}% do total).`,
        value: `${turnoDominante.percentage.toFixed(1)}%`,
        priority: "medium",
        icon: Calendar,
        color: turnoDominante.percentage > 40 ? "destructive" : "info"
      });
    }

    // 4. Análise do Bairro Mais Crítico
    if (bairrosData.length > 0) {
      const bairroCritico = bairrosData[0];
      const segundoBairro = bairrosData[1];
      
      let description = `${bairroCritico.name} lidera com ${bairrosData[0].count} ocorrências (${bairroCritico.percentage.toFixed(1)}% do total).`;
      
      if (segundoBairro) {
        const diferenca = bairroCritico.count - segundoBairro.count;
        description += ` Supera o segundo colocado (${segundoBairro.name}) por ${diferenca} ocorrências.`;
      }
      
      analysisResults.push({
        id: "bairro-critico",
        title: "Área de Maior Concentração",
        description,
        value: bairroCritico.name,
        priority: "high",
        icon: MapPin,
        color: bairroCritico.percentage > 15 ? "destructive" : "warning"
      });
    }

    // 5. Análise do Tipo de Crime Dominante
    if (fatosDPRanking.length > 0) {
      const fatoDominante = fatosDPRanking[0];
      const outrosFatos = fatosDPRanking.slice(1, 3);
      
      let description = `${fatoDominante.name} é o tipo mais frequente com ${fatoDominante.count} casos (${fatoDominante.percentage.toFixed(1)}%).`;
      
      if (outrosFatos.length > 0) {
        const nomesOutros = outrosFatos.map(f => f.name).join(" e ");
        description += ` Seguido por: ${nomesOutros}.`;
      }
      
      analysisResults.push({
        id: "crime-dominante",
        title: "Tipo de Ocorrência Prevalente",
        description,
        value: `${fatoDominante.percentage.toFixed(1)}%`,
        priority: "high",
        icon: AlertTriangle,
        color: fatoDominante.percentage > 30 ? "destructive" : "warning"
      });
    }

    // 6. Análise de Efetividade das Prisões
    const taxaPrisao = filteredData.length > 0 ? (totalPrisoes / filteredData.length) * 100 : 0;
    const mediaPorPrisao = totalPrisoes > 0 ? totalPresos / totalPrisoes : 0;
    
    let prisaoDescription = `Taxa de prisão de ${taxaPrisao.toFixed(1)}% (${totalPrisoes} prisões em ${filteredData.length} ocorrências).`;
    
    if (totalPresos > 0) {
      prisaoDescription += ` Média de ${mediaPorPrisao.toFixed(1)} presos por ocorrência com prisão.`;
    }
    
    analysisResults.push({
      id: "efetividade-prisao",
      title: "Efetividade das Ações",
      description: prisaoDescription,
      value: `${taxaPrisao.toFixed(1)}%`,
      priority: "medium",
      icon: CheckCircle,
      color: taxaPrisao > 20 ? "success" : taxaPrisao > 10 ? "warning" : "destructive"
    });

    // 7. Análise de Distribuição Geográfica
    const bairrosUnicos = bairrosData.length;
    const concentracao = bairrosData.slice(0, 3).reduce((sum, b) => sum + b.percentage, 0);
    
    analysisResults.push({
      id: "distribuicao-geografica",
      title: "Dispersão Geográfica",
      description: `Ocorrências distribuídas em ${bairrosUnicos} bairros diferentes. Os 3 principais concentram ${concentracao.toFixed(1)}% dos casos.`,
      value: `${bairrosUnicos} bairros`,
      priority: "low",
      icon: MapPin,
      color: concentracao > 60 ? "warning" : "info"
    });

    // 8. Análise Temporal (se houver dados de diferentes dias)
    const datasUnicas = [...new Set(filteredData.map(r => r.DATA))];
    if (datasUnicas.length > 1) {
      const mediaPorDia = filteredData.length / datasUnicas.length;
      
      analysisResults.push({
        id: "analise-temporal",
        title: "Padrão Temporal",
        description: `Período analisado abrange ${datasUnicas.length} dias diferentes, com média de ${mediaPorDia.toFixed(1)} ocorrências por dia.`,
        value: `${mediaPorDia.toFixed(1)}/dia`,
        priority: "low",
        icon: TrendingUp,
        color: "info"
      });
    }

    // Ordenar por prioridade
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return analysisResults.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
  }, [filteredData, allData, turnos, hourlyData, fatosDPRanking, bairrosData, totalPrisoes, totalPresos, hasActiveFilters]);

  const getColorStyles = (color: AnalysisInsight['color']) => {
    switch (color) {
      case "success":
        return "border-l-success bg-success/5";
      case "warning":
        return "border-l-warning bg-warning/5";
      case "destructive":
        return "border-l-destructive bg-destructive/5";
      case "info":
        return "border-l-info bg-info/5";
      default:
        return "border-l-primary bg-primary/5";
    }
  };

  const getIconColor = (color: AnalysisInsight['color']) => {
    switch (color) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "destructive":
        return "text-destructive";
      case "info":
        return "text-info";
      default:
        return "text-primary";
    }
  };

  const getPriorityBadge = (priority: AnalysisInsight['priority']) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="secondary">Média</Badge>;
      case "low":
        return <Badge variant="outline">Baixa</Badge>;
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análise Dinâmica dos Dados
          </CardTitle>
          <Badge variant="outline">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${getColorStyles(insight.color)}`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${getIconColor(insight.color)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        {insight.title}
                      </h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.value && (
                      <div className="mt-2">
                        <span className={`font-mono text-lg font-bold ${getIconColor(insight.color)}`}>
                          {insight.value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {insights.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Nenhuma análise disponível para os dados atuais.
            </p>
          </div>
        )}
        
        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Dica:</strong> Esta análise é atualizada automaticamente conforme você aplica filtros. 
            Os insights mudam dinamicamente para refletir os dados selecionados e destacar padrões relevantes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};