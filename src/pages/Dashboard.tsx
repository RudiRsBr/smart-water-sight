import { Droplets, Timer, AlertTriangle, Clock, Activity, BarChart3 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import KPICard from "@/components/KPICard";
import ReservoirCard from "@/components/ReservoirCard";
import AlertItem from "@/components/AlertItem";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useReservoirsWithDetails } from "@/hooks/useReservoirs";
import { useAlerts, useAcknowledgeAlert } from "@/hooks/useAlerts";
import { useHourlyLevels, useWeeklyConsumption } from "@/hooks/useChartData";

const kpiIcons = [Droplets, Timer, AlertTriangle, Clock];

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: reservoirsList } = useReservoirsWithDetails();
  const { data: alertsList } = useAlerts();
  const acknowledgeMutation = useAcknowledgeAlert();
  const { data: hourlyResult } = useHourlyLevels();
  const hourlyLevels = hourlyResult?.data || [];
  const reservoirNames = hourlyResult?.reservoirs || [];
  const { data: weeklyData } = useWeeklyConsumption();

  const activeAlerts = (alertsList || []).filter((a) => a.status === "active");
  const reservoirsDisplay = (reservoirsList || []).slice(0, 4);
  const alertsDisplay = (alertsList || []).slice(0, 4);

  const totalReservoirs = stats?.reservoirs.length || 0;
  const activePumps = (stats?.pumps || []).filter((p) => p.status === "ligada").length;
  const faultyPumps = (stats?.pumps || []).filter((p) => p.status === "falha").length;

  const kpis = [
    { label: "Reservatórios", value: String(totalReservoirs), change: 0, unit: "total" },
    { label: "Bombas Ativas", value: String(activePumps), change: 0, unit: "ligadas" },
    { label: "Alertas Ativos", value: String(activeAlerts.length), change: activeAlerts.length > 0 ? activeAlerts.length : 0, unit: "pendentes" },
    { label: "Sensores Online", value: String((stats?.sensors || []).filter((s) => s.status === "online").length), change: 0, unit: "online" },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do monitoramento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      {/* Charts row - still using mock data for historical charts until readings accumulate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Nível dos Reservatórios</h3>
              <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
            </div>
            <Activity className="w-4 h-4 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyLevels}>
              <defs>
                {reservoirNames.map((name, i) => {
                  const colors = [
                    "hsl(199, 89%, 48%)",
                    "hsl(142, 71%, 45%)",
                    "hsl(38, 92%, 50%)",
                    "hsl(0, 84%, 60%)",
                    "hsl(262, 83%, 58%)",
                    "hsl(187, 72%, 50%)",
                  ];
                  const color = colors[i % colors.length];
                  return (
                    <linearGradient key={name} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 90%)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              {reservoirNames.map((name, i) => {
                const colors = [
                  "hsl(199, 89%, 48%)",
                  "hsl(142, 71%, 45%)",
                  "hsl(38, 92%, 50%)",
                  "hsl(0, 84%, 60%)",
                  "hsl(262, 83%, 58%)",
                  "hsl(187, 72%, 50%)",
                ];
                const color = colors[i % colors.length];
                return (
                  <Area key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} fill={`url(#gradient-${i})`} name={name} />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Consumo Semanal</h3>
              <p className="text-xs text-muted-foreground">Litros por dia</p>
            </div>
            <BarChart3 className="w-4 h-4 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 90%)", borderRadius: "8px", fontSize: "12px" }} formatter={(value: number) => [`${value.toLocaleString("pt-BR")} L`, "Consumo"]} />
              <Bar dataKey="consumo" fill="hsl(187, 72%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reservoirs + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Reservatórios</h3>
            <span className="text-xs text-muted-foreground">{totalReservoirs} monitorados</span>
          </div>
          {reservoirsDisplay.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservoirsDisplay.map((r) => (
                <ReservoirCard key={r.id} reservoir={r} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhum reservatório cadastrado</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Alertas Recentes</h3>
            <span className="text-xs font-medium text-status-critical">{activeAlerts.length} ativos</span>
          </div>
          {alertsDisplay.length > 0 ? (
            <div className="space-y-3">
              {alertsDisplay.map((a) => (
                <AlertItem key={a.id} alert={a} onAcknowledge={(id) => acknowledgeMutation.mutate(id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhum alerta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
