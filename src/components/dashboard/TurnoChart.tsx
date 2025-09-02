import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TimeAnalysis } from "@/types/dashboard";

interface TurnoChartProps {
  data: TimeAnalysis[];
}

const COLORS = {
  'Manhã': 'hsl(var(--warning))',
  'Tarde': 'hsl(var(--info))',
  'Noite': 'hsl(var(--primary))',
  'Madrugada': 'hsl(var(--destructive))'
};

export const TurnoChart = ({ data }: TurnoChartProps) => {
  const chartConfig = {
    count: {
      label: "Ocorrências",
    },
    Manhã: {
      label: "Manhã (06h-12h)",
      color: COLORS.Manhã,
    },
    Tarde: {
      label: "Tarde (12h-18h)",
      color: COLORS.Tarde,
    },
    Noite: {
      label: "Noite (18h-24h)",
      color: COLORS.Noite,
    },
    Madrugada: {
      label: "Madrugada (00h-06h)",
      color: COLORS.Madrugada,
    },
  };

  const chartData = data.map(item => ({
    ...item,
    fill: COLORS[item.turno as keyof typeof COLORS] || 'hsl(var(--muted))'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Turno</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="count"
                nameKey="turno"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipContent
                        active={active}
                        payload={[
                          {
                            name: data.turno,
                            value: `${data.count} ocorrências (${data.percentage.toFixed(1)}%)`,
                            color: data.fill || COLORS[data.turno as keyof typeof COLORS] || 'hsl(var(--muted))'
                          }
                        ]}
                      />
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.turno} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[item.turno as keyof typeof COLORS] || 'hsl(var(--muted))' }}
              />
              <span className="text-sm">
                {item.turno}: {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};