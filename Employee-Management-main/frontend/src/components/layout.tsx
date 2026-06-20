import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Menu,
  X,
  Bell,
  ChevronRight,
  Calendar,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/employees", label: "Employees", icon: Users },
  { path: "/reports", label: "Reports & Analytics", icon: BarChart3 },
];

const PAGE_TITLES: Record<string, { title: string; crumbs: string[] }> = {
  "/": { title: "Dashboard", crumbs: ["Home", "Dashboard"] },
  "/employees": { title: "Employees", crumbs: ["Home", "Employees"] },
  "/reports": { title: "Reports & Analytics", crumbs: ["Home", "Reports"] },
};

function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  return (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div className="px-5 pt-7 pb-6 border-b border-black/8">
        <div className="flex items-center gap-3">
          <img
            src="/teceze-logo.png"
            alt="Teceze"
            className="h-12 w-auto object-contain drop-shadow-sm"
          />
          <div>
            <p className="text-sm font-bold text-foreground leading-tight tracking-tight">Teceze</p>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">EMS Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="px-4 pt-5 pb-2 flex-1">
        <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
          Navigation
        </p>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? "neu-pressed text-primary shadow-none"
                    : "text-muted-foreground hover:text-foreground hover:neu-extruded-sm"
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-4 pb-5 space-y-3">
        <div className="neu-pressed rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-300" />
            <span className="text-xs text-foreground font-semibold">All systems operational</span>
          </div>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-[10px] text-muted-foreground font-medium">Teceze EMS v1.0.0</p>
          <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Teceze Digital Innovation</p>
        </div>
      </div>
    </div>
  );
}

function TopBar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const [location] = useLocation();
  const page = PAGE_TITLES[location] ?? { title: "Page", crumbs: ["Home"] };
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  return (
    <header className="flex items-center justify-between gap-4 mb-7">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden neu-button p-2.5 rounded-xl"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5 font-medium">
            {page.crumbs.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={11} className="opacity-60" />}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">{page.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 neu-extruded-sm rounded-xl px-3.5 py-2.5 text-xs text-muted-foreground font-medium">
          <Calendar size={13} className="shrink-0" />
          <span>{dateStr}</span>
        </div>

        <button className="relative neu-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-sm" />
        </button>

        <div className="flex items-center gap-2.5 neu-extruded-sm rounded-xl px-3.5 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-tight">Admin</p>
            <p className="text-[10px] text-muted-foreground leading-tight font-medium">HR Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-black/8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/teceze-logo.png" alt="Teceze" className="h-7 w-auto opacity-50" />
          <span className="text-xs text-muted-foreground font-medium">Digital Innovation & Excellence</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Teceze. All rights reserved.</span>
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <span className="hidden sm:inline font-medium">Employee Management System</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[272px] shrink-0 fixed top-0 left-0 h-screen z-40 p-4">
        <div className="neu-extruded rounded-2xl h-full overflow-hidden bg-background border border-white/40">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full p-4">
            <div className="neu-extruded rounded-2xl h-full overflow-hidden bg-background border border-white/40">
              <Sidebar onClose={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-[272px] min-h-screen">
        <div className="p-5 md:p-8">
          <TopBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
}
