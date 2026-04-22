"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, clearAuth, getUser } from "@/lib/auth";
import Link from "next/link";
import { User } from "@/lib/types";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Plus,
  Search,
} from "lucide-react";

const NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Mes Tâches", icon: CheckSquare, path: "/tasks" },
  { name: "Planning Intelligent", icon: CalendarDays, path: "/planner" },
  { name: "Statistiques", icon: BarChart3, path: "/statistics" },
  { name: "Paramètres", icon: Settings, path: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setUser(getUser());
    }
  }, [router]);

  if (!user) return null;

  const initial = user.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#0f172a",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#f1f5f9",
      position: "relative",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "fixed", top: "-10%", right: "-5%",
        width: "40%", height: "40%",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", left: "-5%",
        width: "40%", height: "40%",
        background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 76 : 260,
        minHeight: "100vh",
        background: "rgba(15,23,42,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "22px 16px" : "24px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          gap: 10,
          minHeight: 72,
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 16, color: "#fff", fontStyle: "italic",
                boxShadow: "0 4px 16px rgba(59,130,246,0.4)", flexShrink: 0,
              }}>T</div>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", whiteSpace: "nowrap", color: "#f8fafc" }}>
                time-MAN3
              </span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 16, color: "#fff", fontStyle: "italic",
            }}>T</div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748b", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s",
          }}>
            {collapsed
              ? <ChevronRight size={15} color="#94a3b8" />
              : <ChevronLeft size={15} color="#94a3b8" />
            }
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname?.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "13px 0" : "12px 14px",
                borderRadius: 12,
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "rgba(59,130,246,0.14)" : "transparent",
                border: isActive ? "1px solid rgba(59,130,246,0.22)" : "1px solid transparent",
                color: isActive ? "#60a5fa" : "rgba(148,163,184,0.75)",
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                transition: "all 0.18s",
                position: "relative",
              }}>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
                {isActive && !collapsed && (
                  <div style={{
                    position: "absolute", right: 12,
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#3b82f6",
                    boxShadow: "0 0 8px rgba(59,130,246,0.9)",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {!collapsed && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 6,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0,
              }}>{initial}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#f1f5f9" }}>
                  {user.fullName}
                </p>
                <p style={{ fontSize: 11, color: "rgba(148,163,184,0.55)", margin: 0, fontWeight: 500 }}>Pro Student</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { clearAuth(); router.push("/"); }}
            style={{
              width: "100%", padding: collapsed ? "13px 0" : "11px 14px",
              borderRadius: 12, border: "1px solid transparent",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 10, color: "rgba(148,163,184,0.55)",
              fontSize: 14, fontWeight: 600,
              transition: "all 0.18s", fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.color = "#f87171";
              btn.style.background = "rgba(248,113,113,0.08)";
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.color = "rgba(148,163,184,0.55)";
              btn.style.background = "transparent";
            }}
          >
            <LogOut size={17} strokeWidth={1.8} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{
          height: 72,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 20,
          gap: 16,
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <Search size={16} color="rgba(148,163,184,0.45)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              placeholder="Rechercher des tâches..."
              style={{
                width: "100%", padding: "10px 14px 10px 40px",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.04)", color: "#f1f5f9",
                fontSize: 14, fontFamily: "inherit", outline: "none",
                boxSizing: "border-box", transition: "border 0.2s",
              }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{
              width: 40, height: 40, borderRadius: 11,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={18} color="#94a3b8" />
              <div style={{
                position: "absolute", top: 9, right: 9,
                width: 7, height: 7, borderRadius: "50%",
                background: "#3b82f6", border: "2px solid #0f172a",
              }} />
            </button>

            <Link href="/tasks/new" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 11,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
            }}>
              <Plus size={17} strokeWidth={2.5} />
              Tâche
            </Link>

            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 15, color: "#fff", cursor: "pointer",
            }}>{initial}</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
