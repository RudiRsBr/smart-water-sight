import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TowerForm {
  name: string;
  condominium_id: string;
  floors: number | null;
  units: number | null;
}

export function useTowers(condominiumId?: string) {
  return useQuery({
    queryKey: ["towers", condominiumId],
    enabled: !!condominiumId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("towers")
        .select("*, reservoirs(count)")
        .eq("condominium_id", condominiumId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useAllTowers() {
  return useQuery({
    queryKey: ["towers-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("towers")
        .select("*, condominiums!inner(name), reservoirs(count)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTower() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: TowerForm) => {
      const { error } = await supabase.from("towers").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["towers"] });
      qc.invalidateQueries({ queryKey: ["towers-all"] });
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      toast.success("Torre criada com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateTower() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...form }: TowerForm & { id: string }) => {
      const { error } = await supabase.from("towers").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["towers"] });
      qc.invalidateQueries({ queryKey: ["towers-all"] });
      toast.success("Torre atualizada");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTower() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("towers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["towers"] });
      qc.invalidateQueries({ queryKey: ["towers-all"] });
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      toast.success("Torre excluída");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
