import AlertItem from "@/components/AlertItem";
import { alerts } from "@/data/mockData";
import { Bell, Filter } from "lucide-react";

const Alertas = () => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Alertas</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeAlerts.length} alertas ativos · {acknowledgedAlerts.length} reconhecidos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors">
          <Filter className="w-4 h-4" /> Filtrar
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-status-critical mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Ativos ({activeAlerts.length})
          </h2>
          <div className="space-y-3">
            {activeAlerts.map(a => <AlertItem key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Reconhecidos ({acknowledgedAlerts.length})</h2>
          <div className="space-y-3">
            {acknowledgedAlerts.map(a => <AlertItem key={a.id} alert={a} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Alertas;
