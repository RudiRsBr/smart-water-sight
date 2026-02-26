import { Droplets, Timer, AlertTriangle, Clock, Activity, BarChart3 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import KPICard from "@/components/KPICard";
import ReservoirCard from "@/components/ReservoirCard";
import AlertItem from "@/components/AlertItem";
import { kpis, reservoirs, alerts, historicalReadings, weeklyConsumption } from "@/data/mockData";

const kpiIcons = [Droplets, Timer, AlertTriangle, Clock];

const Dashboard = () => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do monitoramento · Residencial Águas Claras</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Level history */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Nível dos Reservatórios</h3>
              <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
            </div>
            <Activity className="w-4 h-4 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historicalReadings}>
              <defs>
                <linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(214, 20%, 90%)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="levelPercent" stroke="hsl(199, 89%, 48%)" strokeWidth={2} fill="url(#levelGradient)" name="Nível (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly consumption */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Consumo Semanal</h3>
              <p className="text-xs text-muted-foreground">Litros por dia</p>
            </div>
            <BarChart3 className="w-4 h-4 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyConsumption}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(214, 20%, 90%)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value.toLocaleString('pt-BR')} L`, 'Consumo']}
              />
              <Bar dataKey="consumo" fill="hsl(187, 72%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reservoirs + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reservoirs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Reservatórios</h3>
            <span className="text-xs text-muted-foreground">{reservoirs.length} monitorados</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservoirs.slice(0, 4).map(r => (
              <ReservoirCard key={r.id} reservoir={r} />
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Alertas Recentes</h3>
            <span className="text-xs font-medium text-status-critical">{activeAlerts.length} ativos</span>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 4).map(a => (
              <AlertItem key={a.id} alert={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
