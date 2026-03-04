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

      // Group by hour and reservoir (use full datetime key for correct sorting)
      const hourBuckets: Record<string, Record<string, number[]>> = {};
      readings.forEach((r) => {
        const dt = new Date(r.recorded_at);
        const sortKey = format(dt, "yyyy-MM-dd HH:00");
        const info = sensorInfo[r.sensor_id];
        if (!info) return;
        const pct = Math.min(100, Math.max(0, (Number(r.value) / info.heightCm) * 100));
        if (!hourBuckets[sortKey]) hourBuckets[sortKey] = {};
        if (!hourBuckets[sortKey][info.reservoirName]) hourBuckets[sortKey][info.reservoirName] = [];
        hourBuckets[sortKey][info.reservoirName].push(pct);
      });

      const data: HourlyReading[] = Object.entries(hourBuckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([sortKey, reservoirs]) => {
          const displayTime = sortKey.slice(11); // extract "HH:00"
          const point: HourlyReading = { timestamp: displayTime };
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

      // Get all pumps with their flow rate
      const { data: pumps } = await supabase
        .from("pumps")
        .select("id, flow_rate_lph, reservoir_id");

      if (!pumps || pumps.length === 0) {
        for (let i = 6; i >= 0; i--) {
          const d = subDays(new Date(), i);
          days.push({ day: dayNames[d.getDay()], consumo: 0 });
        }
        return days;
      }

      const pumpIds = pumps.map((p) => p.id);
      const flowRateMap: Record<string, number> = {};
      pumps.forEach((p) => {
        flowRateMap[p.id] = Number(p.flow_rate_lph) || 0;
      });

      const since = subDays(startOfDay(new Date()), 6).toISOString();

      // Get pump events for the last 7 days
      const { data: events } = await supabase
        .from("pump_events")
        .select("pump_id, event_type, occurred_at")
        .in("pump_id", pumpIds)
        .gte("occurred_at", since)
        .order("occurred_at", { ascending: true });

      // Calculate runtime per pump per day from on/off events
      // Group events by pump
      const pumpEventMap: Record<string, Array<{ type: string; at: Date }>> = {};
      (events || []).forEach((e: any) => {
        if (!pumpEventMap[e.pump_id]) pumpEventMap[e.pump_id] = [];
        pumpEventMap[e.pump_id].push({ type: e.event_type, at: new Date(e.occurred_at) });
      });

      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dayKey = format(d, "yyyy-MM-dd");
        const dayStart = startOfDay(d);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        let totalConsumo = 0;

        Object.entries(pumpEventMap).forEach(([pumpId, evts]) => {
          const flowRate = flowRateMap[pumpId] || 0;
          if (flowRate === 0) return;

          // Filter events relevant to this day (include last event before day start for initial state)
          const dayEvents = evts.filter((e) => e.at >= dayStart && e.at < dayEnd);
          const beforeDay = evts.filter((e) => e.at < dayStart);
          const initialState = beforeDay.length > 0 ? beforeDay[beforeDay.length - 1].type : "off";

          let runtimeMs = 0;
          let lastOnAt: Date | null = initialState === "on" ? dayStart : null;

          dayEvents.forEach((evt) => {
            if (evt.type === "on") {
              lastOnAt = evt.at;
            } else if ((evt.type === "off" || evt.type === "fault") && lastOnAt) {
              runtimeMs += evt.at.getTime() - lastOnAt.getTime();
              lastOnAt = null;
            }
          });

          // If pump was still on at end of day
          if (lastOnAt) {
            const endTime = i === 0 ? new Date() : dayEnd;
            runtimeMs += endTime.getTime() - lastOnAt.getTime();
          }

          const runtimeHours = runtimeMs / (1000 * 60 * 60);
          totalConsumo += flowRate * runtimeHours;
        });

        days.push({ day: dayNames[d.getDay()], consumo: Math.round(totalConsumo) });
      }

      return days;
    },
    refetchInterval: 60000,
  });
}
