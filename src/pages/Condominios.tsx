import { condominiums, reservoirs, alerts } from "@/data/mockData";
import { Building2, Droplets, AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  ok: { bg: "bg-status-ok/10", text: "text-status-ok", label: "Normal" },
  warning: { bg: "bg-status-warning/10", text: "text-status-warning", label: "Atenção" },
  critical: { bg: "bg-status-critical/10", text: "text-status-critical", label: "Crítico" },
  offline: { bg: "bg-muted", text: "text-status-offline", label: "Offline" },
};

const Condominios = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Condomínios</h1>
          <p className="text-sm text-muted-foreground mt-1">{condominiums.length} condomínios cadastrados</p>
        </div>
        <button className="px-4 py-2 rounded-lg hydro-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          + Novo Condomínio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {condominiums.map(condo => {
          const config = statusConfig[condo.status];
          const condoReservoirs = reservoirs.filter(r => r.condominiumId === condo.id);
          const condoAlerts = alerts.filter(a => a.condominiumName === condo.name && !a.acknowledged);

          return (
            <div key={condo.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg hydro-gradient flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", config.bg, config.text)}>
                  {config.label}
                </span>
              </div>

              <h3 className="text-base font-semibold text-card-foreground mb-1">{condo.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                <MapPin className="w-3 h-3" /> {condo.address}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold font-display text-card-foreground">{condo.towers}</p>
                  <p className="text-[10px] text-muted-foreground">Torres</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold font-display text-secondary">{condoReservoirs.length}</p>
                  <p className="text-[10px] text-muted-foreground">Reservatórios</p>
                </div>
                <div className="text-center">
                  <p className={cn("text-lg font-bold font-display", condoAlerts.length > 0 ? "text-status-critical" : "text-status-ok")}>
                    {condoAlerts.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Alertas</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Condominios;
