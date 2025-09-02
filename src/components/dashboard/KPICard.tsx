import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

export const KPICard = ({ title, value, icon: Icon, trend, variant = "default" }: KPICardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "destructive":
        return "border-destructive/20 bg-destructive/5";
      case "info":
        return "border-info/20 bg-info/5";
      default:
        return "border-primary/20 bg-primary/5";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
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

  const getTrendStyles = () => {
    if (!trend) return "";
    return trend.value >= 0 ? "text-success" : "text-destructive";
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", getIconStyles())} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </div>
          {trend && (
            <div className={cn("text-xs font-medium", getTrendStyles())}>
              {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}% {trend.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};