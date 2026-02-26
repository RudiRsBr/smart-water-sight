import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle, Wifi, Zap, Droplets, Check } from "lucide-react";
import type { Alert } from "@/data/mockData";

const alertIcons = {
  low_level: Droplets,
  pump_fault: Zap,
  no_response: Wifi,
  leak_suspected: AlertTriangle,
  pump_overtime: Zap,
};

const alertLabels = {
  low_level: "Nível Baixo",
  pump_fault: "Falha na Bomba",
  no_response: "Sem Comunicação",
  leak_suspected: "Vazamento Suspeito",
  pump_overtime: "Bomba em Excesso",
};

interface AlertItemProps {
  alert: Alert;
}

const AlertItem = ({ alert }: AlertItemProps) => {
  const Icon = alertIcons[alert.type];
  const isCritical = alert.severity === 'critical';

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
      alert.acknowledged
        ? "bg-muted/30 border-border opacity-70"
        : isCritical
          ? "bg-status-critical/5 border-status-critical/20"
          : "bg-status-warning/5 border-status-warning/20"
    )}>
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        isCritical ? "bg-status-critical/10" : "bg-status-warning/10"
      )}>
        <Icon className={cn("w-4 h-4", isCritical ? "text-status-critical" : "text-status-warning")} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
            isCritical ? "bg-status-critical/10 text-status-critical" : "bg-status-warning/10 text-status-warning"
          )}>
            {alertLabels[alert.type]}
          </span>
          {alert.acknowledged && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Check className="w-3 h-3" /> Reconhecido
            </span>
          )}
        </div>
        <p className="text-sm text-card-foreground font-medium truncate">{alert.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {alert.condominiumName} · {alert.reservoirName} · {new Date(alert.timestamp).toLocaleString('pt-BR')}
        </p>
      </div>

      {!alert.acknowledged && (
        <button className="shrink-0 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors px-2 py-1 rounded hover:bg-secondary/5">
          Reconhecer
        </button>
      )}
    </div>
  );
};

export default AlertItem;
