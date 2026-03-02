import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useAlertsByDay(days = 30) {
  return useQuery({
    queryKey: ["reports-alerts-by-day", days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      const { data, error } = await supabase
        .from("alerts")
        .select("id, severity, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const map = new Map<string, { date: string; critical: number; warning: number; info: number }>();
      for (let i = 0; i < days; i++) {
        const d = format(subDays(new Date(), days - 1 - i), "dd/MM");
        map.set(d, { date: d, critical: 0, warning: 0, info: 0 });
      }

      (data || []).forEach((a) => {
        const d = format(new Date(a.created_at), "dd/MM");
        const entry = map.get(d);
        if (entry && (a.severity === "critical" || a.severity === "warning" || a.severity === "info")) {
          entry[a.severity]++;
        }
      });

      return Array.from(map.values());
    },
  });
}

export function useAlertsBySeverity() {
  return useQuery({
    queryKey: ["reports-alerts-severity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("severity");
      if (error) throw error;

      const counts = { critical: 0, warning: 0, info: 0 };
      (data || []).forEach((a) => {
        if (a.severity === "critical" || a.severity === "warning" || a.severity === "info") {
          counts[a.severity]++;
        }
      });

      return [
        { name: "Crítico", value: counts.critical, fill: "hsl(var(--status-critical))" },
        { name: "Alerta", value: counts.warning, fill: "hsl(var(--status-warning))" },
        { name: "Info", value: counts.info, fill: "hsl(var(--status-good))" },
      ];
    },
  });
}

export function useSensorStatusSummary() {
  return useQuery({
    queryKey: ["reports-sensor-status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sensors").select("status");
      if (error) throw error;

      const counts = { online: 0, offline: 0, manutencao: 0 };
      (data || []).forEach((s) => {
        if (s.status === "online" || s.status === "offline" || s.status === "manutencao") {
          counts[s.status]++;
        }
      });

      return [
        { name: "Online", value: counts.online, fill: "hsl(var(--status-good))" },
        { name: "Offline", value: counts.offline, fill: "hsl(var(--status-critical))" },
        { name: "Manutenção", value: counts.manutencao, fill: "hsl(var(--status-warning))" },
      ];
    },
  });
}

export function usePumpStatusSummary() {
  return useQuery({
    queryKey: ["reports-pump-status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pumps").select("status");
      if (error) throw error;

      const counts = { ligada: 0, desligada: 0, manutencao: 0, falha: 0 };
      (data || []).forEach((p) => {
        if (p.status in counts) {
          counts[p.status as keyof typeof counts]++;
        }
      });

      return [
        { name: "Ligada", value: counts.ligada, fill: "hsl(var(--status-good))" },
        { name: "Desligada", value: counts.desligada, fill: "hsl(215, 16%, 47%)" },
        { name: "Manutenção", value: counts.manutencao, fill: "hsl(var(--status-warning))" },
        { name: "Falha", value: counts.falha, fill: "hsl(var(--status-critical))" },
      ];
    },
  });
}

export function useReservoirLevels() {
  return useQuery({
    queryKey: ["reports-reservoir-levels"],
    queryFn: async () => {
      const { data: reservoirs, error: rErr } = await supabase
        .from("reservoirs")
        .select("id, name, height_cm, capacity_liters, tower_id, towers!inner(name, condominiums!inner(name))");
      if (rErr) throw rErr;

      const rIds = (reservoirs || []).map((r) => r.id);
      if (rIds.length === 0) return [];

      const { data: sensors } = await supabase
        .from("sensors")
        .select("id, reservoir_id")
        .in("reservoir_id", rIds)
        .eq("type", "nivel");

      const sIds = (sensors || []).map((s) => s.id);
      if (sIds.length === 0) {
        return (reservoirs || []).map((r: any) => ({
          name: r.name,
          condominium: r.towers?.condominiums?.name || "",
          level: 0,
          capacity: r.capacity_liters,
        }));
      }

      const { data: readings } = await supabase
        .from("readings")
        .select("sensor_id, value")
        .in("sensor_id", sIds)
        .order("recorded_at", { ascending: false })
        .limit(sIds.length);

      const latestBySensor = new Map<string, number>();
      (readings || []).forEach((r) => {
        if (!latestBySensor.has(r.sensor_id)) latestBySensor.set(r.sensor_id, r.value);
      });

      const sensorToReservoir = new Map<string, string>();
      (sensors || []).forEach((s) => sensorToReservoir.set(s.id, s.reservoir_id));

      return (reservoirs || []).map((r: any) => {
        const sensor = (sensors || []).find((s) => s.reservoir_id === r.id);
        const reading = sensor ? latestBySensor.get(sensor.id) : undefined;
        const level = reading != null && r.height_cm > 0 ? Math.min(100, Math.round((reading / r.height_cm) * 100)) : 0;
        return {
          name: r.name,
          condominium: r.towers?.condominiums?.name || "",
          level,
          capacity: r.capacity_liters,
        };
      });
    },
  });
}
