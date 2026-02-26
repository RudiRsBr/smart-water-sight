import { Bell, Search, User, LogOut } from "lucide-react";
import { alerts } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar reservatórios, condomínios..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Bell className="w-5 h-5" />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-status-critical text-[9px] font-bold text-status-critical-foreground flex items-center justify-center pulse-status">
              {unacknowledgedCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-8 h-8 rounded-full hydro-gradient flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
            </p>
            <p className="text-[10px] text-muted-foreground">{user?.email}</p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={signOut}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
