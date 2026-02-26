import { BarChart3 } from "lucide-react";

const Relatorios = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
      <p className="text-sm text-muted-foreground mt-1">Exporte dados e visualize relatórios detalhados</p>
    </div>
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
      <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-base font-medium text-muted-foreground">Em breve</p>
      <p className="text-sm text-muted-foreground/60 mt-1">Relatórios exportáveis serão adicionados aqui</p>
    </div>
  </div>
);

export default Relatorios;
