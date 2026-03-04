import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ReservoirType = Database["public"]["Enums"]["reservoir_type"];

export interface ReservoirForm {
  name: string;
  tower_id: string;
  capacity_liters: number;
  height_cm: number;
  type: ReservoirType;
}

export function useReservoirsWithDetails() {
  return useQuery({
    queryKey: ["reservoirs-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservoirs")
        .select("*, towers!inner(name, condominium_id, condominiums!inner(name))")
        .order("name");
      if (error) throw error;

      // Get pumps and latest sensor readings for each reservoir
      const reservoirIds = data.map((r) => r.id);
      
      const [pumpsRes, sensorsRes] = await Promise.all([
        supabase.from("pumps").select("*").in("reservoir_id", reservoirIds),
        supabase.from("sensors").select("*, readings(value, unit, recorded_at)").in("reservoir_id", reservoirIds).eq("type", "nivel"),
      ]);

      return data.map((r: any) => {
        const pump = (pumpsRes.data || []).find((p) => p.reservoir_id === r.id);
        const sensor = (sensorsRes.data || []).find((s: any) => s.reservoir_id === r.id);
        const latestReading = sensor?.readings?.sort((a: any, b: any) => 
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        )?.[0];

        const levelPercent = latestReading
          ? Math.min(100, Math.max(0, (Number(latestReading.value) / Number(r.height_cm)) * 100))
          : 0;

        return {
          ...r,
          towerName: r.towers?.name || "",
          condominiumName: r.towers?.condominiums?.name || "",
          condominiumId: r.towers?.condominium_id || "",
          capacityLiters: Number(r.capacity_liters),
          currentLevelPercent: Math.round(levelPercent),
          currentVolumeLiters: Math.round((levelPercent / 100) * Number(r.capacity_liters)),
          pumpStatus: pump?.status === "ligada" ? "on" : pump?.status === "falha" ? "fault" : "off",
          lastReading: latestReading?.recorded_at || sensor?.last_reading_at || r.created_at,
          flowRate: pump ? Number(pump.flow_rate_lph) || 0 : 0,
          status: levelPercent < 20 ? "critical" : levelPercent < 40 ? "warning" : levelPercent > 0 ? "ok" : "offline",
        };
      });
    },
  });
}

export function useCreateReservoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: ReservoirForm) => {
      const { error } = await supabase.from("reservoirs").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservoirs"] });
      qc.invalidateQueries({ queryKey: ["reservoirs-details"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      toast.success("Reservatório criado com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateReservoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...form }: ReservoirForm & { id: string }) => {
      const { error } = await supabase.from("reservoirs").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservoirs"] });
      qc.invalidateQueries({ queryKey: ["reservoirs-details"] });
      toast.success("Reservatório atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteReservoir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reservoirs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservoirs"] });
      qc.invalidateQueries({ queryKey: ["reservoirs-details"] });
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      toast.success("Reservatório excluído");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
