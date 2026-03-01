import { cn } from "@/lib/utils";
import { Droplets, Zap, ZapOff, AlertTriangle, Clock } from "lucide-react";

export interface ReservoirCardData {
  id: string;
  name: string;
  towerName: string;
  capacityLiters: number;
  currentLevelPercent: number;
  currentVolumeLiters: number;
  status: "ok" | "warning" | "critical" | "offline";
  pumpStatus: "on" | "off" | "fault";
  lastReading: string;
  flowRate: number;
}

interface ReservoirCardProps {
  reservoir: ReservoirCardData;
}

const statusConfig = {
  ok: { bg: "bg-status-ok/10", border: "border-status-ok/30", text: "text-status-ok", label: "Normal" },
  warning: { bg: "bg-status-warning/10", border: "border-status-warning/30", text: "text-status-warning", label: "Atenção" },
  critical: { bg: "bg-status-critical/10", border: "border-status-critical/30", text: "text-status-critical", label: "Crítico" },
  offline: { bg: "bg-muted", border: "border-muted-foreground/20", text: "text-status-offline", label: "Offline" },
};

const ReservoirCard = ({ reservoir }: ReservoirCardProps) => {
  const config = statusConfig[reservoir.status];
  const pumpOn = reservoir.pumpStatus === "on";
  const pumpFault = reservoir.pumpStatus === "fault";

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300 group",
      config.border
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className={cn("w-5 h-5", config.text)} />
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">{reservoir.name}</h3>
            <p className="text-xs text-muted-foreground">{reservoir.towerName}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", config.bg, config.text)}>
          {config.label}
        </span>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <div className="relative w-16 h-24 rounded-lg border-2 border-border overflow-hidden bg-muted/30">
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 rounded-b-md transition-all duration-1000 ease-out",
              reservoir.status === "critical" ? "bg-status-critical/60" :
              reservoir.status === "warning" ? "bg-status-warning/40" :
              "bg-secondary/50"
            )}
            style={{ height: `${reservoir.currentLevelPercent}%` }}
          >
            <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-transparent to-primary-foreground/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold font-display text-foreground drop-shadow-sm">
              {reservoir.currentLevelPercent}%
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Volume</span>
            <span className="font-medium text-card-foreground">
              {(reservoir.currentVolumeLiters / 1000).toFixed(1)}k L
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Capacidade</span>
            <span className="font-medium text-card-foreground">
              {(Number(reservoir.capacityLiters) / 1000).toFixed(0)}k L
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Vazão</span>
            <span className="font-medium text-card-foreground">
              {reservoir.flowRate} L/h
            </span>
          </div>
        </div>
      </div>

      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
        pumpFault ? "bg-status-critical/10 text-status-critical" :
        pumpOn ? "bg-status-ok/10 text-status-ok" :
        "bg-muted text-muted-foreground"
      )}>
        {pumpFault ? (
          <><AlertTriangle className="w-3.5 h-3.5" /> Bomba em falha</>
        ) : pumpOn ? (
          <><Zap className="w-3.5 h-3.5" /> Bomba ligada</>
        ) : (
          <><ZapOff className="w-3.5 h-3.5" /> Bomba desligada</>
        )}
        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          {new Date(reservoir.lastReading).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default ReservoirCard;
