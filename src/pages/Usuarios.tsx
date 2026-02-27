import { useState } from "react";
import { Users, Shield, Plus, X, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfiles, useUserRoles, useAssignRole, useRemoveRole, useUserCondominiums, useLinkUserCondominium, useUnlinkUserCondominium } from "@/hooks/useUsers";
import { useCondominiums } from "@/hooks/useCondominiums";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  sindico: "Síndico",
  zelador: "Zelador",
  tecnico: "Técnico",
  empresa_manutencao: "Empresa Manutenção",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-status-critical/10 text-status-critical border-status-critical/30",
  sindico: "bg-secondary/10 text-secondary border-secondary/30",
  zelador: "bg-status-ok/10 text-status-ok border-status-ok/30",
  tecnico: "bg-accent/10 text-accent border-accent/30",
  empresa_manutencao: "bg-status-warning/10 text-status-warning border-status-warning/30",
};

const Usuarios = () => {
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: roles, isLoading: loadingRoles } = useUserRoles();
  const { data: condominiums } = useCondominiums();
  const { data: userCondos } = useUserCondominiums();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const linkCondo = useLinkUserCondominium();
  const unlinkCondo = useUnlinkUserCondominium();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<AppRole | "">("");
  const [newCondoId, setNewCondoId] = useState("");

  const getUserRoles = (userId: string) =>
    (roles || []).filter((r) => r.user_id === userId);

  const getUserCondos = (userId: string) =>
    (userCondos || []).filter((uc) => uc.user_id === userId);

  const selectedProfile = profiles?.find((p) => p.id === selectedUser);

  if (loadingProfiles || loadingRoles) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profiles?.length || 0} usuários cadastrados
        </p>
      </div>

      {(!profiles || profiles.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
          <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-muted-foreground">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const userRoles = getUserRoles(profile.id);
            const userCondoLinks = getUserCondos(profile.id);

            return (
              <div
                key={profile.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-all cursor-pointer"
                onClick={() => setSelectedUser(profile.id)}
              >
                <div className="w-10 h-10 rounded-full hydro-gradient flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">
                    {(profile.full_name || profile.email || "?")[0].toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground truncate">
                    {profile.full_name || "Sem nome"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {userRoles.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Sem role</span>
                  )}
                  {userRoles.map((r) => (
                    <Badge
                      key={r.id}
                      variant="outline"
                      className={cn("text-[10px]", roleColors[r.role as AppRole])}
                    >
                      {roleLabels[r.role as AppRole]}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Gerenciar Usuário</DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full hydro-gradient flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {(selectedProfile.full_name || selectedProfile.email || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedProfile.full_name || "Sem nome"}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                </div>
              </div>

              {/* Roles */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Roles
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {getUserRoles(selectedProfile.id).map((r) => (
                    <Badge
                      key={r.id}
                      variant="outline"
                      className={cn("text-xs gap-1", roleColors[r.role as AppRole])}
                    >
                      {roleLabels[r.role as AppRole]}
                      <button
                        onClick={() => removeRole.mutate(r.id)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {getUserRoles(selectedProfile.id).length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Nenhuma role atribuída</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.app_role
                        .filter((r) => !getUserRoles(selectedProfile.id).some((ur) => ur.role === r))
                        .map((r) => (
                          <SelectItem key={r} value={r}>
                            {roleLabels[r]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!newRole || assignRole.isPending}
                    onClick={() => {
                      if (newRole) {
                        assignRole.mutate(
                          { user_id: selectedProfile.id, role: newRole as AppRole },
                          { onSuccess: () => setNewRole("") }
                        );
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Condominiums */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Condomínios Vinculados
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {getUserCondos(selectedProfile.id).map((uc) => {
                    const condo = condominiums?.find((c) => c.id === uc.condominium_id);
                    return (
                      <Badge key={uc.id} variant="outline" className="text-xs gap-1">
                        {condo?.name || "..."}
                        <button
                          onClick={() => unlinkCondo.mutate(uc.id)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  {getUserCondos(selectedProfile.id).length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Nenhum condomínio vinculado</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={newCondoId} onValueChange={setNewCondoId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar condomínio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(condominiums || [])
                        .filter((c) => !getUserCondos(selectedProfile.id).some((uc) => uc.condominium_id === c.id))
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!newCondoId || linkCondo.isPending}
                    onClick={() => {
                      if (newCondoId) {
                        linkCondo.mutate(
                          { user_id: selectedProfile.id, condominium_id: newCondoId },
                          { onSuccess: () => setNewCondoId("") }
                        );
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;
