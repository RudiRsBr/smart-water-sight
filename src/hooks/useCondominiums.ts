import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CondominiumForm {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export function useCondominiums() {
  return useQuery({
    queryKey: ["condominiums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("condominiums")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCondominiumWithCounts() {
  return useQuery({
    queryKey: ["condominiums-with-counts"],
    queryFn: async () => {
      const { data: condos, error } = await supabase
        .from("condominiums")
        .select(`
          *,
          towers(id, reservoirs(id, alerts(id, status)))
        `)
        .order("name");
      if (error) throw error;

      return (condos || []).map((c: any) => {
        const towers = c.towers || [];
        const reservoirs = towers.flatMap((t: any) => t.reservoirs || []);
        const activeAlerts = reservoirs.flatMap((r: any) =>
          (r.alerts || []).filter((a: any) => a.status === "active")
        );
        return {
          ...c,
          towersCount: towers.length,
          reservoirsCount: reservoirs.length,
          activeAlertsCount: activeAlerts.length,
        };
      });
    },
  });
}

export function useCreateCondominium() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (form: CondominiumForm) => {
      const { data, error } = await supabase
        .from("condominiums")
        .insert(form)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      qc.invalidateQueries({ queryKey: ["condominiums-with-counts"] });
      toast({ title: "Condomínio criado com sucesso" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao criar condomínio", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateCondominium() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...form }: CondominiumForm & { id: string }) => {
      const { data, error } = await supabase
        .from("condominiums")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      qc.invalidateQueries({ queryKey: ["condominiums-with-counts"] });
      toast({ title: "Condomínio atualizado" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCondominium() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("condominiums").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["condominiums"] });
      qc.invalidateQueries({ queryKey: ["condominiums-with-counts"] });
      toast({ title: "Condomínio excluído" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });
}
