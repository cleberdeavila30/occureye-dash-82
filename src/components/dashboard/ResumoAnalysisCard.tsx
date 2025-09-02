import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserX, Banknote, HandMetal } from "lucide-react";

interface ResumoAnalysisProps {
  data: {
    violenciaDomestica: number;
    foragidos: number;
    furtos: number;
    roubos: number;
  };
}

export const ResumoAnalysisCard = ({ data }: ResumoAnalysisProps) => {
  const items = [
    {
      label: "Violência Doméstica",
      value: data.violenciaDomestica,
      icon: Shield,
      color: "text-destructive"
    },
    {
      label: "Foragidos",
      value: data.foragidos,
      icon: UserX,
      color: "text-warning"
    },
    {
      label: "Furtos",
      value: data.furtos,
      icon: Banknote,
      color: "text-info"
    },
    {
      label: "Roubos",
      value: data.roubos,
      icon: HandMetal,
      color: "text-destructive"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Análise por Tipo de Crime</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {item.value.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};