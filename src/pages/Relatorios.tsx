import { BarChart3, Activity, Gauge, Zap, Droplets, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";
import {
  useAlertsByDay,
  useAlertsBySeverity,
  useSensorStatusSummary,
  usePumpStatusSummary,
  useReservoirLevels,
} from "@/hooks/useReports";

const ChartCard = ({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle: string; icon: React.ElementType; children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Icon className="w-4 h-4 text-secondary" />
    </div>
    {children}
  </div>
);

const COLORS_SEVERITY = ["hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)", "hsl(199, 89%, 48%)"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

const Relatorios = () => {
  const { data: alertsByDay, isLoading: l1 } = useAlertsByDay(30);
  const { data: alertsBySeverity, isLoading: l2 } = useAlertsBySeverity();
  const { data: sensorStatus, isLoading: l3 } = useSensorStatusSummary();
  const { data: pumpStatus, isLoading: l4 } = usePumpStatusSummary();
  const { data: reservoirLevels, isLoading: l5 } = useReservoirLevels();

  const isLoading = l1 || l2 || l3 || l4 || l5;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalAlerts = (alertsBySeverity || []).reduce((s, a) => s + a.value, 0);
  const totalSensors = (sensorStatus || []).reduce((s, a) => s + a.value, 0);
  const totalPumps = (pumpStatus || []).reduce((s, a) => s + a.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão analítica do sistema — alertas, sensores, bombas e reservatórios
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Alertas", value: totalAlerts, icon: BarChart3 },
          { label: "Sensores", value: totalSensors, icon: Activity },
          { label: "Bombas", value: totalPumps, icon: Zap },
          { label: "Reservatórios", value: (reservoirLevels || []).length, icon: Droplets },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <s.icon className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts timeline */}
      <ChartCard title="Alertas nos últimos 30 dias" subtitle="Por severidade" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={alertsByDay || []}>
            <defs>
              <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="warnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="critical" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#critGrad)" name="Crítico" />
            <Area type="monotone" dataKey="warning" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#warnGrad)" name="Alerta" />
            <Area type="monotone" dataKey="info" stroke="hsl(199, 89%, 48%)" strokeWidth={1.5} fill="transparent" name="Info" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Alertas por Severidade" subtitle={`${totalAlerts} total`} icon={BarChart3}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={alertsBySeverity || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {(alertsBySeverity || []).map((_, i) => (
                  <Cell key={i} fill={COLORS_SEVERITY[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status dos Sensores" subtitle={`${totalSensors} total`} icon={Activity}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sensorStatus || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {(sensorStatus || []).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status das Bombas" subtitle={`${totalPumps} total`} icon={Zap}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pumpStatus || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="name" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""} labelLine={false}>
                {(pumpStatus || []).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Reservoir levels bar chart */}
      {(reservoirLevels || []).length > 0 && (
        <ChartCard title="Nível Atual dos Reservatórios" subtitle="Percentual de capacidade" icon={Gauge}>
          <ResponsiveContainer width="100%" height={Math.max(200, (reservoirLevels || []).length * 40)}>
            <BarChart data={reservoirLevels || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Nível"]} />
              <Bar dataKey="level" radius={[0, 4, 4, 0]} fill="hsl(199, 89%, 48%)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
};

export default Relatorios;
