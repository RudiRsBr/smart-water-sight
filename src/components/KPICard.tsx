import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  unit: string;
  change: number;
  icon: LucideIcon;
}

const KPICard = ({ label, value, unit, change, icon: Icon }: KPICardProps) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
          isNeutral ? "bg-muted text-muted-foreground" :
          isPositive ? "bg-status-warning/10 text-status-warning" :
          "bg-status-ok/10 text-status-ok"
        )}>
          {isNeutral ? <Minus className="w-3 h-3" /> :
           isPositive ? <TrendingUp className="w-3 h-3" /> :
           <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold font-display text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {label} <span className="text-muted-foreground/60">({unit})</span>
      </p>
    </div>
  );
};

export default KPICard;
