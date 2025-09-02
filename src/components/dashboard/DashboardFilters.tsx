import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { DashboardFilters as FilterType } from "@/types/dashboard";
import { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";

interface DashboardFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  availableYears: number[];
  availableBairros: string[];
  availableFatos: string[];
}

export const DashboardFilters = ({
  filters,
  onFiltersChange,
  availableYears,
  availableBairros,
  availableFatos
}: DashboardFiltersProps) => {
  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      startDate: range?.from,
      endDate: range?.to
    });
  };

  const handleYearChange = (value: string) => {
    onFiltersChange({
      ...filters,
      ano: value === "all" ? undefined : parseInt(value)
    });
  };

  const handleBairroChange = (value: string) => {
    onFiltersChange({
      ...filters,
      bairro: value === "all" ? undefined : value
    });
  };

  const handleFatoChange = (value: string) => {
    onFiltersChange({
      ...filters,
      fato_dp: value === "all" ? undefined : value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.ano || filters.bairro || filters.fato_dp;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Período</label>
          <DateRangePicker
            dateRange={{ from: filters.startDate, to: filters.endDate }}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Ano</label>
          <Select value={filters.ano?.toString() || "all"} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Bairro</label>
          <Select value={filters.bairro || "all"} onValueChange={handleBairroChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar bairro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {availableBairros.map(bairro => (
                <SelectItem key={bairro} value={bairro}>
                  {bairro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tipo de Fato</label>
          <Select value={filters.fato_dp || "all"} onValueChange={handleFatoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar fato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os fatos</SelectItem>
              {availableFatos.map(fato => (
                <SelectItem key={fato} value={fato}>
                  {fato}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};