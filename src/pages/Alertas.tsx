import AlertItem from "@/components/AlertItem";
import { useAlerts, useAcknowledgeAlert } from "@/hooks/useAlerts";
import { Bell, Filter } from "lucide-react";

const Alertas = () => {
  const { data: alerts, isLoading } = useAlerts();
  const acknowledgeMutation = useAcknowledgeAlert();

  const activeAlerts = (alerts || []).filter((a) => a.status === "active");
  const acknowledgedAlerts = (alerts || []).filter((a) => a.status !== "active");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Alertas</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeAlerts.length} alertas ativos · {acknowledgedAlerts.length} reconhecidos</p>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-status-critical mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Ativos ({activeAlerts.length})
          </h2>
          <div className="space-y-3">
            {activeAlerts.map((a) => (
              <AlertItem key={a.id} alert={a} onAcknowledge={(id) => acknowledgeMutation.mutate(id)} />
            ))}
          </div>
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Reconhecidos ({acknowledgedAlerts.length})</h2>
          <div className="space-y-3">
            {acknowledgedAlerts.map((a) => <AlertItem key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {(!alerts || alerts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
          <Bell className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-muted-foreground">Nenhum alerta registrado</p>
        </div>
      )}
    </div>
  );
};

export default Alertas;
