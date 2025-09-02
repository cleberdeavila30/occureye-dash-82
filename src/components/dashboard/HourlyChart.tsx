import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { HourlyData } from "@/types/dashboard";

interface HourlyChartProps {
  data: HourlyData[];
}

export const HourlyChart = ({ data }: HourlyChartProps) => {
  const chartConfig = {
    count: {
      label: "Ocorrências",
      color: "hsl(var(--primary))",
    },
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}h`;
  };

  const chartData = data.map(item => ({
    ...item,
    hourLabel: formatHour(item.hour)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Horário</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hourLabel" 
                fontSize={12}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent
                        active={active}
                        payload={[
                          {
                            name: "Ocorrências",
                            value: `${payload[0].value} registros`,
                            color: "hsl(var(--primary))"
                          }
                        ]}
                        label={`Horário: ${label}`}
                      />
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};