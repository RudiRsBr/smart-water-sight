import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SensorType = Database["public"]["Enums"]["sensor_type"];
type SensorStatus = Database["public"]["Enums"]["sensor_status"];

export interface SensorForm {
  reservoir_id: string;
  type: SensorType;
  model: string | null;
  serial_number: string | null;
}

export function useSensors(reservoirId?: string) {
  return useQuery({
    queryKey: ["sensors", reservoirId],
    queryFn: async () => {
      let query = supabase
        .from("sensors")
        .select("*, reservoirs!inner(name, towers!inner(name, condominiums!inner(name)))")
        .order("created_at", { ascending: false });
      if (reservoirId) query = query.eq("reservoir_id", reservoirId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((s: any) => ({
        ...s,
        reservoirName: s.reservoirs?.name || "",
        towerName: s.reservoirs?.towers?.name || "",
        condominiumName: s.reservoirs?.towers?.condominiums?.name || "",
      }));
    },
  });
}

export function useCreateSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: SensorForm) => {
      const { error } = await supabase.from("sensors").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sensors"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Sensor criado com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...form }: SensorForm & { id: string; status?: SensorStatus }) => {
      const { error } = await supabase.from("sensors").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sensors"] });
      toast.success("Sensor atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sensors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sensors"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Sensor excluído");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
