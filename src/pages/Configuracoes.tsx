import { useState } from "react";
import { User, Mail, Phone, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Configuracoes = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      return (data || []).map((r) => r.role);
    },
  });

  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setForm({ full_name: profile.full_name || "", phone: profile.phone || "" });
    setInitialized(true);
  }

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: form.full_name, phone: form.phone, updated_at: new Date().toISOString() })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });

  const updatePassword = useMutation({
    mutationFn: async () => {
      if (passwordForm.password !== passwordForm.confirm) throw new Error("As senhas não coincidem");
      if (passwordForm.password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres");
      const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
      if (error) throw error;
    },
    onSuccess: () => {
      setPasswordForm({ password: "", confirm: "" });
      toast.success("Senha alterada com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    sindico: "Síndico",
    zelador: "Zelador",
    tecnico: "Técnico",
    empresa_manutencao: "Empresa de Manutenção",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full hydro-gradient flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">Perfil</h2>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        {userRoles && userRoles.length > 0 && (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-secondary" />
            <div className="flex gap-1.5 flex-wrap">
              {userRoles.map((role) => (
                <span key={role} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                  {roleLabels[role] || role}
                </span>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nome completo</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
            <Input value={profile?.email || ""} disabled className="mt-1.5 opacity-60" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="mt-1.5" />
          </div>
          <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="hydro-gradient">
            <Save className="w-4 h-4 mr-1" />
            {updateProfile.isPending ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </div>
      </div>

      {/* Password section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
        <h2 className="text-base font-semibold text-card-foreground">Alterar Senha</h2>
        <div className="space-y-4">
          <div>
            <Label>Nova senha</Label>
            <Input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Confirmar nova senha</Label>
            <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="mt-1.5" />
          </div>
          <Button variant="outline" onClick={() => updatePassword.mutate()} disabled={updatePassword.isPending || !passwordForm.password}>
            {updatePassword.isPending ? "Alterando..." : "Alterar Senha"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
