import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-slate-200 shadow-2xs", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

