import ReservoirCard from "@/components/ReservoirCard";
import { reservoirs, condominiums } from "@/data/mockData";
import { Droplets, Filter } from "lucide-react";

const Reservatorios = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reservatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">{reservoirs.length} reservatórios em {condominiums.length} condomínios</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors">
          <Filter className="w-4 h-4" /> Filtrar
        </button>
      </div>

      {condominiums.map(condo => {
        const condoReservoirs = reservoirs.filter(r => r.condominiumId === condo.id);
        if (condoReservoirs.length === 0) return null;
        return (
          <div key={condo.id}>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-secondary" />
              <h2 className="text-base font-semibold text-foreground">{condo.name}</h2>
              <span className="text-xs text-muted-foreground">— {condo.address}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {condoReservoirs.map(r => (
                <ReservoirCard key={r.id} reservoir={r} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Reservatorios;
