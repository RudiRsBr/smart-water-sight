import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useDashboardStats() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
        qc.invalidateQueries({ queryKey: ["alerts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "readings" }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
        qc.invalidateQueries({ queryKey: ["recent-readings"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [reservoirsRes, alertsRes, pumpsRes, sensorsRes] = await Promise.all([
        supabase.from("reservoirs").select("id, name, capacity_liters, height_cm, type, tower_id, towers!inner(name, condominium_id, condominiums!inner(name))"),
        supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("pumps").select("*"),
        supabase.from("sensors").select("id, type, status, reservoir_id, last_reading_at"),
      ]);

      return {
        reservoirs: (reservoirsRes.data || []) as any[],
        alerts: (alertsRes.data || []) as any[],
        pumps: (pumpsRes.data || []) as any[],
        sensors: (sensorsRes.data || []) as any[],
      };
    },
  });
}

export function useRecentReadings(sensorIds: string[]) {
  return useQuery({
    queryKey: ["recent-readings", sensorIds],
    enabled: sensorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("readings")
        .select("*")
        .in("sensor_id", sensorIds)
        .order("recorded_at", { ascending: false })
        .limit(sensorIds.length * 2);
      return data || [];
    },
  });
}
