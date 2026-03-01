import { useState } from "react";
import { Cpu, Zap, Plus, Pencil, Trash2, Wifi, WifiOff, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useSensors, useCreateSensor, useUpdateSensor, useDeleteSensor, type SensorForm } from "@/hooks/useSensors";
import { usePumps, useCreatePump, useUpdatePump, useDeletePump, type PumpForm } from "@/hooks/usePumps";
import { useReservoirsWithDetails } from "@/hooks/useReservoirs";
import type { Database } from "@/integrations/supabase/types";

type SensorType = Database["public"]["Enums"]["sensor_type"];
type PumpStatus = Database["public"]["Enums"]["pump_status"];

const sensorTypeLabels: Record<SensorType, string> = {
  nivel: "Nível", pressao: "Pressão", vazao: "Vazão", qualidade: "Qualidade",
};

const sensorStatusConfig = {
  online: { icon: Wifi, color: "text-status-ok", bg: "bg-status-ok/10", label: "Online" },
  offline: { icon: WifiOff, color: "text-status-critical", bg: "bg-status-critical/10", label: "Offline" },
  manutencao: { icon: Activity, color: "text-status-warning", bg: "bg-status-warning/10", label: "Manutenção" },
};

const pumpStatusLabels: Record<PumpStatus, string> = {
  ligada: "Ligada", desligada: "Desligada", manutencao: "Manutenção", falha: "Falha",
};

const pumpStatusColors: Record<PumpStatus, string> = {
  ligada: "bg-status-ok/10 text-status-ok",
  desligada: "bg-muted text-muted-foreground",
  manutencao: "bg-status-warning/10 text-status-warning",
  falha: "bg-status-critical/10 text-status-critical",
};

const Index = () => {
  const { data: sensors, isLoading: sensorsLoading } = useSensors();
  const { data: pumps, isLoading: pumpsLoading } = usePumps();
  const { data: reservoirs } = useReservoirsWithDetails();

  const createSensor = useCreateSensor();
  const updateSensor = useUpdateSensor();
  const deleteSensor = useDeleteSensor();
  const createPump = useCreatePump();
  const updatePump = useUpdatePump();
  const deletePump = useDeletePump();

  const [activeTab, setActiveTab] = useState<"sensores" | "bombas">("sensores");

  // Sensor form
  const [sensorFormOpen, setSensorFormOpen] = useState(false);
  const [sensorEdit, setSensorEdit] = useState<any>(null);
  const [sensorDeleteId, setSensorDeleteId] = useState<string | null>(null);
  const [sensorForm, setSensorForm] = useState<SensorForm>({ reservoir_id: "", type: "nivel", model: "", serial_number: "" });

  // Pump form
  const [pumpFormOpen, setPumpFormOpen] = useState(false);
  const [pumpEdit, setPumpEdit] = useState<any>(null);
  const [pumpDeleteId, setPumpDeleteId] = useState<string | null>(null);
  const [pumpForm, setPumpForm] = useState<PumpForm>({ reservoir_id: "", name: "", model: "", power_hp: null });

  const openSensorCreate = () => {
    setSensorForm({ reservoir_id: "", type: "nivel", model: "", serial_number: "" });
    setSensorEdit(null);
    setSensorFormOpen(true);
  };

  const openSensorEdit = (s: any) => {
    setSensorForm({ reservoir_id: s.reservoir_id, type: s.type, model: s.model || "", serial_number: s.serial_number || "" });
    setSensorEdit(s);
    setSensorFormOpen(true);
  };

  const handleSensorSave = () => {
    if (sensorEdit) {
      updateSensor.mutate({ ...sensorForm, id: sensorEdit.id }, { onSuccess: () => setSensorFormOpen(false) });
    } else {
      createSensor.mutate(sensorForm, { onSuccess: () => setSensorFormOpen(false) });
    }
  };

  const openPumpCreate = () => {
    setPumpForm({ reservoir_id: "", name: "", model: "", power_hp: null });
    setPumpEdit(null);
    setPumpFormOpen(true);
  };

  const openPumpEdit = (p: any) => {
    setPumpForm({ reservoir_id: p.reservoir_id, name: p.name, model: p.model || "", power_hp: p.power_hp });
    setPumpEdit(p);
    setPumpFormOpen(true);
  };

  const handlePumpSave = () => {
    if (pumpEdit) {
      updatePump.mutate({ ...pumpForm, id: pumpEdit.id }, { onSuccess: () => setPumpFormOpen(false) });
    } else {
      createPump.mutate(pumpForm, { onSuccess: () => setPumpFormOpen(false) });
    }
  };

  const isLoading = sensorsLoading || pumpsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Sensores & Bombas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sensors?.length || 0} sensores · {pumps?.length || 0} bombas
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "sensores" ? (
            <Button className="hydro-gradient" onClick={openSensorCreate}>
              <Plus className="w-4 h-4 mr-1" /> Novo Sensor
            </Button>
          ) : (
            <Button className="hydro-gradient" onClick={openPumpCreate}>
              <Plus className="w-4 h-4 mr-1" /> Nova Bomba
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("sensores")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "sensores" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          <Cpu className="w-4 h-4 inline mr-1" /> Sensores
        </button>
        <button
          onClick={() => setActiveTab("bombas")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "bombas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          <Zap className="w-4 h-4 inline mr-1" /> Bombas
        </button>
      </div>

      {activeTab === "sensores" ? (
        (sensors && sensors.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((s: any) => {
              const statusCfg = sensorStatusConfig[s.status as keyof typeof sensorStatusConfig];
              const StatusIcon = statusCfg.icon;
              return (
                <div key={s.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", statusCfg.bg)}>
                        <StatusIcon className={cn("w-4 h-4", statusCfg.color)} />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px]">{sensorTypeLabels[s.type as SensorType]}</Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.serial_number || "Sem número"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openSensorEdit(s)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setSensorDeleteId(s.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reservatório</span>
                      <span className="text-card-foreground font-medium">{s.reservoirName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Torre</span>
                      <span className="text-card-foreground font-medium">{s.towerName}</span>
                    </div>
                    {s.model && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modelo</span>
                        <span className="text-card-foreground font-medium">{s.model}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={cn("font-medium", statusCfg.color)}>{statusCfg.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
            <Cpu className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-base font-medium text-muted-foreground">Nenhum sensor cadastrado</p>
          </div>
        )
      ) : (
        (pumps && pumps.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pumps.map((p: any) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.reservoirName}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openPumpEdit(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setPumpDeleteId(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condomínio</span>
                    <span className="text-card-foreground font-medium">{p.condominiumName}</span>
                  </div>
                  {p.model && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelo</span>
                      <span className="text-card-foreground font-medium">{p.model}</span>
                    </div>
                  )}
                  {p.power_hp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potência</span>
                      <span className="text-card-foreground font-medium">{p.power_hp} HP</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horas de operação</span>
                    <span className="text-card-foreground font-medium">{Number(p.hours_run).toFixed(0)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", pumpStatusColors[p.status as PumpStatus])}>
                      {pumpStatusLabels[p.status as PumpStatus]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
            <Zap className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-base font-medium text-muted-foreground">Nenhuma bomba cadastrada</p>
          </div>
        )
      )}

      {/* Sensor Form Dialog */}
      <Dialog open={sensorFormOpen} onOpenChange={setSensorFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sensorEdit ? "Editar Sensor" : "Novo Sensor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reservatório</Label>
              <Select value={sensorForm.reservoir_id} onValueChange={(v) => setSensorForm({ ...sensorForm, reservoir_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(reservoirs || []).map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} — {r.towerName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={sensorForm.type} onValueChange={(v) => setSensorForm({ ...sensorForm, type: v as SensorType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nivel">Nível</SelectItem>
                  <SelectItem value="pressao">Pressão</SelectItem>
                  <SelectItem value="vazao">Vazão</SelectItem>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Modelo</Label>
                <Input value={sensorForm.model || ""} onChange={(e) => setSensorForm({ ...sensorForm, model: e.target.value || null })} />
              </div>
              <div>
                <Label>Número de Série</Label>
                <Input value={sensorForm.serial_number || ""} onChange={(e) => setSensorForm({ ...sensorForm, serial_number: e.target.value || null })} />
              </div>
            </div>
            <Button className="w-full hydro-gradient" onClick={handleSensorSave} disabled={createSensor.isPending || updateSensor.isPending}>
              {(createSensor.isPending || updateSensor.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pump Form Dialog */}
      <Dialog open={pumpFormOpen} onOpenChange={setPumpFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pumpEdit ? "Editar Bomba" : "Nova Bomba"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={pumpForm.name} onChange={(e) => setPumpForm({ ...pumpForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Reservatório</Label>
              <Select value={pumpForm.reservoir_id} onValueChange={(v) => setPumpForm({ ...pumpForm, reservoir_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(reservoirs || []).map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} — {r.towerName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Modelo</Label>
                <Input value={pumpForm.model || ""} onChange={(e) => setPumpForm({ ...pumpForm, model: e.target.value || null })} />
              </div>
              <div>
                <Label>Potência (HP)</Label>
                <Input type="number" value={pumpForm.power_hp || ""} onChange={(e) => setPumpForm({ ...pumpForm, power_hp: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
            <Button className="w-full hydro-gradient" onClick={handlePumpSave} disabled={createPump.isPending || updatePump.isPending}>
              {(createPump.isPending || updatePump.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Sensor */}
      <AlertDialog open={!!sensorDeleteId} onOpenChange={(o) => !o && setSensorDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sensor?</AlertDialogTitle>
            <AlertDialogDescription>Todas as leituras deste sensor serão perdidas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteSensor.mutate(sensorDeleteId!); setSensorDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Pump */}
      <AlertDialog open={!!pumpDeleteId} onOpenChange={(o) => !o && setPumpDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir bomba?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deletePump.mutate(pumpDeleteId!); setPumpDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
