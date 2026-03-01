import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Droplets, 
  Bell, 
  Building2, 
  Settings, 
  Users, 
  BarChart3,
  Activity,
  Cpu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/reservatorios", icon: Droplets, label: "Reservatórios" },
  { to: "/sensores-bombas", icon: Cpu, label: "Sensores & Bombas" },
  { to: "/alertas", icon: Bell, label: "Alertas", badge: 2 },
  { to: "/condominios", icon: Building2, label: "Condomínios" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { to: "/usuarios", icon: Users, label: "Usuários" },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen hydro-gradient flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary/20 shrink-0">
          <Activity className="w-5 h-5 text-sidebar-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-display font-bold text-sidebar-foreground tracking-tight">
              HydroVision
            </h1>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
              Monitoramento
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-status-critical text-[10px] font-bold text-status-critical-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 mx-3 mb-4 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default AppSidebar;
