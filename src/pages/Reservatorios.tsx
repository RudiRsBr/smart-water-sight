import { useState } from "react";
import { Droplets, Filter, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ReservoirCard from "@/components/ReservoirCard";
import { useReservoirsWithDetails, useCreateReservoir, useUpdateReservoir, useDeleteReservoir, type ReservoirForm } from "@/hooks/useReservoirs";
import { useAllTowers, useCreateTower, useUpdateTower, useDeleteTower, type TowerForm } from "@/hooks/useTowers";
import { useCondominiumWithCounts } from "@/hooks/useCondominiums";
import type { Database } from "@/integrations/supabase/types";

type ReservoirType = Database["public"]["Enums"]["reservoir_type"];

const Reservatorios = () => {
  const { data: reservoirs, isLoading: reservoirsLoading } = useReservoirsWithDetails();
  const { data: towers } = useAllTowers();
  const { data: condominiums } = useCondominiumWithCounts();
  const createReservoir = useCreateReservoir();
  const updateReservoir = useUpdateReservoir();
  const deleteReservoir = useDeleteReservoir();
  const createTower = useCreateTower();
  const updateTower = useUpdateTower();
  const deleteTower = useDeleteTower();

  // Reservoir form state
  const [resFormOpen, setResFormOpen] = useState(false);
  const [resEdit, setResEdit] = useState<(ReservoirForm & { id: string }) | null>(null);
  const [resDeleteId, setResDeleteId] = useState<string | null>(null);
  const [resForm, setResForm] = useState<ReservoirForm>({ name: "", tower_id: "", capacity_liters: 0, height_cm: 0, type: "superior" });

  // Tower form state
  const [towerFormOpen, setTowerFormOpen] = useState(false);
  const [towerEdit, setTowerEdit] = useState<(TowerForm & { id: string }) | null>(null);
  const [towerDeleteId, setTowerDeleteId] = useState<string | null>(null);
  const [towerForm, setTowerForm] = useState<TowerForm>({ name: "", condominium_id: "", floors: null, units: null });

  const [activeTab, setActiveTab] = useState<"reservatorios" | "torres">("reservatorios");

  const openResCreate = () => {
    setResForm({ name: "", tower_id: "", capacity_liters: 0, height_cm: 0, type: "superior" });
    setResEdit(null);
    setResFormOpen(true);
  };

  const openResEdit = (r: any) => {
    setResForm({ name: r.name, tower_id: r.tower_id, capacity_liters: Number(r.capacity_liters), height_cm: Number(r.height_cm), type: r.type });
    setResEdit({ ...r });
    setResFormOpen(true);
  };

  const handleResSave = () => {
    if (resEdit) {
      updateReservoir.mutate({ ...resForm, id: resEdit.id }, { onSuccess: () => setResFormOpen(false) });
    } else {
      createReservoir.mutate(resForm, { onSuccess: () => setResFormOpen(false) });
    }
  };

  const openTowerCreate = () => {
    setTowerForm({ name: "", condominium_id: "", floors: null, units: null });
    setTowerEdit(null);
    setTowerFormOpen(true);
  };

  const openTowerEdit = (t: any) => {
    setTowerForm({ name: t.name, condominium_id: t.condominium_id, floors: t.floors, units: t.units });
    setTowerEdit({ ...t, id: t.id });
    setTowerFormOpen(true);
  };

  const handleTowerSave = () => {
    if (towerEdit) {
      updateTower.mutate({ ...towerForm, id: towerEdit.id }, { onSuccess: () => setTowerFormOpen(false) });
    } else {
      createTower.mutate(towerForm, { onSuccess: () => setTowerFormOpen(false) });
    }
  };

  // Group reservoirs by condominium
  const grouped = (reservoirs || []).reduce((acc: Record<string, { name: string; reservoirs: any[] }>, r: any) => {
    const key = r.condominiumId || "sem-condominio";
    if (!acc[key]) acc[key] = { name: r.condominiumName || "Sem condomínio", reservoirs: [] };
    acc[key].reservoirs.push(r);
    return acc;
  }, {});

  if (reservoirsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-52 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reservatórios & Torres</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reservoirs?.length || 0} reservatórios · {towers?.length || 0} torres
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openTowerCreate}>
            <Plus className="w-4 h-4 mr-1" /> Nova Torre
          </Button>
          <Button className="hydro-gradient" onClick={openResCreate}>
            <Plus className="w-4 h-4 mr-1" /> Novo Reservatório
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("reservatorios")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "reservatorios" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Reservatórios
        </button>
        <button
          onClick={() => setActiveTab("torres")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "torres" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Torres
        </button>
      </div>

      {activeTab === "reservatorios" ? (
        Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([key, group]: [string, any]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-secondary" />
                <h2 className="text-base font-semibold text-foreground">{group.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.reservoirs.map((r: any) => (
                  <div key={r.id} className="relative group/card">
                    <ReservoirCard reservoir={r} />
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button onClick={() => openResEdit(r)} className="p-1.5 rounded-lg bg-card/80 text-muted-foreground hover:text-foreground shadow-sm">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setResDeleteId(r.id)} className="p-1.5 rounded-lg bg-card/80 text-muted-foreground hover:text-destructive shadow-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
            <Droplets className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-base font-medium text-muted-foreground">Nenhum reservatório cadastrado</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Primeiro cadastre um condomínio e uma torre</p>
          </div>
        )
      ) : (
        /* Torres tab */
        (towers && towers.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {towers.map((t: any) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.condominiums?.name}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openTowerEdit(t)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setTowerDeleteId(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-border">
                  <div>
                    <p className="text-lg font-bold font-display text-card-foreground">{t.floors || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Andares</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold font-display text-card-foreground">{t.units || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Unidades</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold font-display text-secondary">{t.reservoirs?.[0]?.count || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Reservatórios</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
            <p className="text-base font-medium text-muted-foreground">Nenhuma torre cadastrada</p>
          </div>
        )
      )}

      {/* Reservoir Form Dialog */}
      <Dialog open={resFormOpen} onOpenChange={setResFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resEdit ? "Editar Reservatório" : "Novo Reservatório"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={resForm.name} onChange={(e) => setResForm({ ...resForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Torre</Label>
              <Select value={resForm.tower_id} onValueChange={(v) => setResForm({ ...resForm, tower_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione a torre" /></SelectTrigger>
                <SelectContent>
                  {(towers || []).map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.condominiums?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Capacidade (litros)</Label>
                <Input type="number" value={resForm.capacity_liters} onChange={(e) => setResForm({ ...resForm, capacity_liters: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Altura (cm)</Label>
                <Input type="number" value={resForm.height_cm} onChange={(e) => setResForm({ ...resForm, height_cm: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={resForm.type} onValueChange={(v) => setResForm({ ...resForm, type: v as ReservoirType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superior">Superior</SelectItem>
                  <SelectItem value="inferior">Inferior</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full hydro-gradient" onClick={handleResSave} disabled={createReservoir.isPending || updateReservoir.isPending}>
              {(createReservoir.isPending || updateReservoir.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tower Form Dialog */}
      <Dialog open={towerFormOpen} onOpenChange={setTowerFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{towerEdit ? "Editar Torre" : "Nova Torre"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={towerForm.name} onChange={(e) => setTowerForm({ ...towerForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Condomínio</Label>
              <Select value={towerForm.condominium_id} onValueChange={(v) => setTowerForm({ ...towerForm, condominium_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o condomínio" /></SelectTrigger>
                <SelectContent>
                  {(condominiums || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Andares</Label>
                <Input type="number" value={towerForm.floors || ""} onChange={(e) => setTowerForm({ ...towerForm, floors: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label>Unidades</Label>
                <Input type="number" value={towerForm.units || ""} onChange={(e) => setTowerForm({ ...towerForm, units: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
            <Button className="w-full hydro-gradient" onClick={handleTowerSave} disabled={createTower.isPending || updateTower.isPending}>
              {(createTower.isPending || updateTower.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Reservoir */}
      <AlertDialog open={!!resDeleteId} onOpenChange={(o) => !o && setResDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reservatório?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteReservoir.mutate(resDeleteId!); setResDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tower */}
      <AlertDialog open={!!towerDeleteId} onOpenChange={(o) => !o && setTowerDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir torre?</AlertDialogTitle>
            <AlertDialogDescription>Todos os reservatórios desta torre serão excluídos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteTower.mutate(towerDeleteId!); setTowerDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reservatorios;
