import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PumpStatus = Database["public"]["Enums"]["pump_status"];

export interface PumpForm {
  reservoir_id: string;
  name: string;
  model: string | null;
  power_hp: number | null;
  flow_rate_lph: number | null;
}

export function usePumps(reservoirId?: string) {
  return useQuery({
    queryKey: ["pumps", reservoirId],
    queryFn: async () => {
      let query = supabase
        .from("pumps")
        .select("*, reservoirs!inner(name, towers!inner(name, condominiums!inner(name)))")
        .order("created_at", { ascending: false });
      if (reservoirId) query = query.eq("reservoir_id", reservoirId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        reservoirName: p.reservoirs?.name || "",
        towerName: p.reservoirs?.towers?.name || "",
        condominiumName: p.reservoirs?.towers?.condominiums?.name || "",
      }));
    },
  });
}

export function useCreatePump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: PumpForm) => {
      const { error } = await supabase.from("pumps").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pumps"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Bomba criada com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdatePump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...form }: PumpForm & { id: string; status?: PumpStatus }) => {
      const update: any = { ...form };
      if ('status' in arguments[0]) update.status = (arguments[0] as any).status;
      const { error } = await supabase.from("pumps").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pumps"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Bomba atualizada");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeletePump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pumps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pumps"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Bomba excluída");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
