import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CondominiumForm } from "@/hooks/useCondominiums";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: CondominiumForm) => void;
  submitting?: boolean;
  initialData?: CondominiumForm & { id?: string };
}

const emptyForm: CondominiumForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
};

const CondominiumFormDialog = ({ open, onOpenChange, onSubmit, submitting, initialData }: Props) => {
  const [form, setForm] = useState<CondominiumForm>(emptyForm);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
    }
  }, [open, initialData]);

  const set = (key: keyof CondominiumForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Editar Condomínio" : "Novo Condomínio"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" value={form.state || ""} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input id="zip_code" value={form.zip_code || ""} onChange={(e) => set("zip_code", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contato</Label>
              <Input id="contact_name" value={form.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefone</Label>
              <Input id="contact_phone" value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">E-mail de contato</Label>
            <Input id="contact_email" type="email" value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="hydro-gradient" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CondominiumFormDialog;
