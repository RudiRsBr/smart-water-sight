import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subHours, startOfDay } from "date-fns";

interface HourlyReading {
  timestamp: string;
  [reservoirName: string]: string | number;
}

interface ReservoirInfo {
  sensorId: string;
  reservoirId: string;
  reservoirName: string;
  heightCm: number;
}

interface DailyConsumption {
  day: string;
  consumo: number;
}

export function useHourlyLevels() {
  return useQuery({
    queryKey: ["chart-hourly-levels"],
    queryFn: async () => {
      const since = subHours(new Date(), 24).toISOString();

      // Get all nivel sensors with their reservoir info
      const { data: sensors } = await supabase
        .from("sensors")
        .select("id, reservoir_id, reservoirs(name, height_cm)")
        .eq("type", "nivel")
        .eq("status", "online");

      if (!sensors || sensors.length === 0) return { data: [] as HourlyReading[], reservoirs: [] as string[] };

      const sensorIds = sensors.map((s) => s.id);
      const sensorInfo: Record<string, ReservoirInfo> = {};
      const reservoirNames = new Set<string>();

      sensors.forEach((s: any) => {
        const name = s.reservoirs?.name || s.reservoir_id;
        sensorInfo[s.id] = {
          sensorId: s.id,
          reservoirId: s.reservoir_id,
          reservoirName: name,
          heightCm: Number(s.reservoirs?.height_cm) || 1,
        };
        reservoirNames.add(name);
      });

      const { data: readings } = await supabase
        .from("readings")
        .select("sensor_id, value, recorded_at")
        .in("sensor_id", sensorIds)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true });

      if (!readings || readings.length === 0) return { data: [] as HourlyReading[], reservoirs: Array.from(reservoirNames) };

      // Group by hour and reservoir
      const hourBuckets: Record<string, Record<string, number[]>> = {};
      readings.forEach((r) => {
        const hour = format(new Date(r.recorded_at), "HH:00");
        const info = sensorInfo[r.sensor_id];
        if (!info) return;
        const pct = Math.min(100, Math.max(0, (Number(r.value) / info.heightCm) * 100));
        if (!hourBuckets[hour]) hourBuckets[hour] = {};
        if (!hourBuckets[hour][info.reservoirName]) hourBuckets[hour][info.reservoirName] = [];
        hourBuckets[hour][info.reservoirName].push(pct);
      });

      const data: HourlyReading[] = Object.entries(hourBuckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([timestamp, reservoirs]) => {
          const point: HourlyReading = { timestamp };
          Object.entries(reservoirs).forEach(([name, values]) => {
            point[name] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
          });
          return point;
        });

      return { data, reservoirs: Array.from(reservoirNames) };
    },
    refetchInterval: 60000,
  });
}

export function useWeeklyConsumption() {
  return useQuery({
    queryKey: ["chart-weekly-consumption"],
    queryFn: async () => {
      const days: DailyConsumption[] = [];
      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

      // Get all nivel sensors with reservoir capacity
      const { data: sensors } = await supabase
        .from("sensors")
        .select("id, reservoir_id, reservoirs(capacity_liters, height_cm)")
        .eq("type", "nivel");

      if (!sensors || sensors.length === 0) {
        // Return empty days
        for (let i = 6; i >= 0; i--) {
          const d = subDays(new Date(), i);
          days.push({ day: dayNames[d.getDay()], consumo: 0 });
        }
        return days;
      }

      const sensorIds = sensors.map((s) => s.id);
      const capacityMap: Record<string, { cap: number; height: number }> = {};
      sensors.forEach((s: any) => {
        capacityMap[s.id] = {
          cap: Number(s.reservoirs?.capacity_liters) || 0,
          height: Number(s.reservoirs?.height_cm) || 1,
        };
      });

      const since = subDays(startOfDay(new Date()), 6).toISOString();
      const { data: readings } = await supabase
        .from("readings")
        .select("sensor_id, value, recorded_at")
        .in("sensor_id", sensorIds)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true });

      // Estimate daily consumption: sum of level drops per day (in liters)
      // Group readings by day and sensor, compute max-min drop
      const dayBuckets: Record<string, Record<string, number[]>> = {};
      (readings || []).forEach((r) => {
        const dayKey = format(new Date(r.recorded_at), "yyyy-MM-dd");
        if (!dayBuckets[dayKey]) dayBuckets[dayKey] = {};
        if (!dayBuckets[dayKey][r.sensor_id]) dayBuckets[dayKey][r.sensor_id] = [];
        dayBuckets[dayKey][r.sensor_id].push(Number(r.value));
      });

      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dayKey = format(d, "yyyy-MM-dd");
        const sensorReadings = dayBuckets[dayKey] || {};
        let totalConsumo = 0;

        Object.entries(sensorReadings).forEach(([sensorId, values]) => {
          if (values.length < 2) return;
          const info = capacityMap[sensorId];
          if (!info) return;
          // Estimate consumption as sum of drops between consecutive readings
          for (let j = 1; j < values.length; j++) {
            const drop = values[j - 1] - values[j];
            if (drop > 0) {
              totalConsumo += (drop / info.height) * info.cap;
            }
          }
        });

        days.push({ day: dayNames[d.getDay()], consumo: Math.round(totalConsumo) });
      }

      return days;
    },
    refetchInterval: 60000,
  });
}
