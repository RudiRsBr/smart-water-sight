import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useUserRoles() {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-roles"] });
      toast({ title: "Role atribuída com sucesso" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao atribuir role", description: err.message, variant: "destructive" });
    },
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-roles"] });
      toast({ title: "Role removida" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao remover role", description: err.message, variant: "destructive" });
    },
  });
}

export function useUserCondominiums() {
  return useQuery({
    queryKey: ["user-condominiums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_condominiums")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useLinkUserCondominium() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ user_id, condominium_id }: { user_id: string; condominium_id: string }) => {
      const { error } = await supabase
        .from("user_condominiums")
        .insert({ user_id, condominium_id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-condominiums"] });
      toast({ title: "Usuário vinculado ao condomínio" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao vincular", description: err.message, variant: "destructive" });
    },
  });
}

export function useUnlinkUserCondominium() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_condominiums")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-condominiums"] });
      toast({ title: "Vínculo removido" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao desvincular", description: err.message, variant: "destructive" });
    },
  });
}
