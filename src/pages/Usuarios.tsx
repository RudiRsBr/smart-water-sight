import { Users } from "lucide-react";

const Usuarios = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
      <p className="text-sm text-muted-foreground mt-1">Gerencie usuários e permissões</p>
    </div>
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
      <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-base font-medium text-muted-foreground">Em breve</p>
      <p className="text-sm text-muted-foreground/60 mt-1">Gestão de usuários e roles será adicionada aqui</p>
    </div>
  </div>
);

export default Usuarios;
