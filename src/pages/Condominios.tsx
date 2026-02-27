import { useState } from "react";
import { Building2, MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CondominiumFormDialog from "@/components/CondominiumFormDialog";
import {
  useCondominiumWithCounts,
  useCreateCondominium,
  useUpdateCondominium,
  useDeleteCondominium,
  type CondominiumForm,
} from "@/hooks/useCondominiums";

const Condominios = () => {
  const { data: condominiums, isLoading } = useCondominiumWithCounts();
  const createMutation = useCreateCondominium();
  const updateMutation = useUpdateCondominium();
  const deleteMutation = useDeleteCondominium();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<(CondominiumForm & { id: string }) | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = (form: CondominiumForm) => {
    createMutation.mutate(form, { onSuccess: () => setFormOpen(false) });
  };

  const handleUpdate = (form: CondominiumForm) => {
    if (!editData?.id) return;
    updateMutation.mutate({ ...form, id: editData.id }, { onSuccess: () => setEditData(undefined) });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Condomínios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {condominiums?.length || 0} condomínios cadastrados
          </p>
        </div>
        <Button className="hydro-gradient" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Novo Condomínio
        </Button>
      </div>

      {(!condominiums || condominiums.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-muted-foreground">Nenhum condomínio cadastrado</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Clique em "Novo Condomínio" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {condominiums.map((condo) => {
            const hasAlerts = condo.activeAlertsCount > 0;
            return (
              <div
                key={condo.id}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg hydro-gradient flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setEditData({
                          id: condo.id,
                          name: condo.name,
                          address: condo.address || "",
                          city: condo.city || "",
                          state: condo.state || "",
                          zip_code: condo.zip_code || "",
                          contact_name: condo.contact_name || "",
                          contact_phone: condo.contact_phone || "",
                          contact_email: condo.contact_email || "",
                        })
                      }
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(condo.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-card-foreground mb-1">{condo.name}</h3>
                {condo.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                    <MapPin className="w-3 h-3" /> {condo.address}
                    {condo.city && `, ${condo.city}`}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold font-display text-card-foreground">
                      {condo.towersCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Torres</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-display text-secondary">
                      {condo.reservoirsCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Reservatórios</p>
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-lg font-bold font-display",
                        hasAlerts ? "text-status-critical" : "text-status-ok"
                      )}
                    >
                      {condo.activeAlertsCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Alertas</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <CondominiumFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        submitting={createMutation.isPending}
      />

      {/* Edit dialog */}
      <CondominiumFormDialog
        open={!!editData}
        onOpenChange={(open) => !open && setEditData(undefined)}
        onSubmit={handleUpdate}
        submitting={updateMutation.isPending}
        initialData={editData}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir condomínio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as torres, reservatórios e dados associados serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Condominios;
