import { cn } from "@/lib/utils";
import { AlertTriangle, Wifi, Zap, Droplets, Check } from "lucide-react";

export interface AlertItemData {
  id: string;
  title: string;
  message: string | null;
  severity: "info" | "warning" | "critical";
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
  reservoirName: string;
  condominiumName: string;
}

const severityConfig = {
  info: { icon: Wifi, label: "Info" },
  warning: { icon: AlertTriangle, label: "Atenção" },
  critical: { icon: Droplets, label: "Crítico" },
};

interface AlertItemProps {
  alert: AlertItemData;
  onAcknowledge?: (id: string) => void;
}

const AlertItem = ({ alert, onAcknowledge }: AlertItemProps) => {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const isCritical = alert.severity === "critical";
  const isAcknowledged = alert.status !== "active";

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
      isAcknowledged
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
            {config.label}
          </span>
          {isAcknowledged && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Check className="w-3 h-3" /> Reconhecido
            </span>
          )}
        </div>
        <p className="text-sm text-card-foreground font-medium truncate">{alert.title}</p>
        {alert.message && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {alert.condominiumName} · {alert.reservoirName} · {new Date(alert.created_at).toLocaleString("pt-BR")}
        </p>
      </div>

      {!isAcknowledged && onAcknowledge && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="shrink-0 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors px-2 py-1 rounded hover:bg-secondary/5"
        >
          Reconhecer
        </button>
      )}
    </div>
  );
};

export default AlertItem;
