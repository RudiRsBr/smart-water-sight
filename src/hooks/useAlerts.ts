import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*, reservoirs!inner(name, towers!inner(condominiums!inner(name)))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        ...a,
        reservoirName: a.reservoirs?.name || "",
        condominiumName: a.reservoirs?.towers?.condominiums?.name || "",
      }));
    },
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("alerts")
        .update({
          status: "acknowledged",
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Alerta reconhecido");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
