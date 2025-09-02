import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingItem } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";

interface RankingTableProps {
  title: string;
  data: RankingItem[];
  maxItems?: number;
}

export const RankingTable = ({ title, data, maxItems = 10 }: RankingTableProps) => {
  const displayData = data.slice(0, maxItems);
  const maxCount = Math.max(...displayData.map(item => item.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayData.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between space-x-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    #{index + 1} {item.name}
                  </p>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-sm font-medium">
                      {item.count.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(item.count / maxCount) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
          {displayData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum dado disponível
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};