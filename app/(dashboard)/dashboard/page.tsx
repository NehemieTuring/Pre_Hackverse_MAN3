"use client";

import { useTasks } from "@/hooks/useTasks";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";
import {
  Flame,
  Zap,
  CheckCircle2,
  Target,
  Plus,
  Clock,
  ArrowRight,
  AlertCircle,
  CircleDashed,
  Loader2,
} from "lucide-react";

const card = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: 20,
  backdropFilter: "blur(12px)",
  boxShadow: "var(--card-shadow)",
} as const;

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function DashboardPage() {
  const { tasks, loading: tasksLoading } = useTasks();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics")
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Use API stats if available, otherwise fallback to local calculation
  const completedCount = stats?.completedTasks ?? tasks.filter(t => t.status === 'DONE').length;
  const totalTasks = stats?.totalTasks ?? tasks.length;
  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const efficiency = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  const totalWorkMin = tasks.reduce((sum, t) => sum + (t.actualTimeSpentMinutes || 0), 0);
  const formatTime = (min: number) => {
    if (min === 0) return "0 min";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  const quadrantData = [
    { name: 'Critique', value: stats?.quadrants?.Q1 ?? tasks.filter(t => t.eisenhowerQuadrant === 'Q1').length, color: '#f87171' },
    { name: 'Planifié', value: stats?.quadrants?.Q2 ?? tasks.filter(t => t.eisenhowerQuadrant === 'Q2').length, color: '#60a5fa' },
    { name: 'Délégué',  value: stats?.quadrants?.Q3 ?? tasks.filter(t => t.eisenhowerQuadrant === 'Q3').length, color: '#fb923c' },
    { name: 'Plus tard', value: stats?.quadrants?.Q4 ?? tasks.filter(t => t.eisenhowerQuadrant === 'Q4').length, color: '#9ca3af' },
  ];

  const kpis = [
    { label: "Tâches totales",  value: totalTasks,      Icon: Flame,        accent: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
    { label: "Temps total",     value: formatTime(totalWorkMin), Icon: Clock, accent: "#fb923c", bg: "rgba(251,146,60,0.12)" },
    { label: "Terminées",       value: completedCount,  Icon: CheckCircle2, accent: "#10b981", bg: "rgba(16,185,129,0.12)"  },
    { label: "Efficacité",      value: `${efficiency}%`, Icon: Target,      accent: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  ];

  const statusMeta: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
    DONE:        { label: "Terminé",  color: "#10b981", Icon: CheckCircle2 },
    IN_PROGRESS: { label: "En cours", color: "#f59e0b", Icon: Zap          },
    TODO:        { label: "À faire",  color: "#64748b", Icon: CircleDashed },
  };

  const activeTask = tasks.find(t => t.status === 'IN_PROGRESS') || tasks.find(t => t.status === 'TODO');

  if (tasksLoading && statsLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <Loader2 className="spin" size={40} color="#3b82f6" />
    </div>
  );

  return (
    <div style={{
      padding: "32px",
      maxWidth: 1280,
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "var(--foreground)",
      display: "flex",
      flexDirection: "column",
      gap: 28,
    }}>

      {/* Welcome Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px", color: "var(--foreground)" }}>
            Bonjour 👋
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: 0, fontWeight: 500 }}>
            Vous avez{" "}
            <strong style={{ color: "var(--accent)" }}>{todoCount} tâche{todoCount > 1 ? "s" : ""}</strong>{" "}
            en attente aujourd'hui.
          </p>
        </div>
        <Link href="/tasks/new" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 24px", borderRadius: 14,
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          color: "#fff", fontWeight: 700, fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
        }}>
          <Plus size={18} strokeWidth={2.5} />
          Nouvelle tâche
        </Link>
      </div>

      {/* Active Focus Banner */}
      {activeTask && (
        <div style={{
          ...card,
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(99,102,241,0.14))",
          border: "1px solid rgba(59,130,246,0.22)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 140, height: 140,
            background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent)",
            borderRadius: "50%",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(59,130,246,0.2)",
              border: "1px solid rgba(59,130,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Clock size={22} color="#60a5fa" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 4px" }}>
                Focus Actif
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--foreground)" }}>{activeTask.title}</h3>
            </div>
          </div>
          <Link href={`/tasks/${activeTask.id}`} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 20px", borderRadius: 11,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            Gérer <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ ...card, padding: "24px 20px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <kpi.Icon size={24} color={kpi.accent} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 3px" }}>
                {kpi.label}
              </p>
              <p style={{ fontSize: 32, fontWeight: 900, margin: 0, color: kpi.accent, letterSpacing: "-0.03em" }}>
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Area chart */}
        <div style={{ ...card, padding: "24px 28px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 24px", color: "var(--foreground)" }}>Répartition Eisenhower</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={quadrantData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--card-border)', borderRadius: 12, fontSize: 13 }} itemStyle={{ color: 'var(--foreground)' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div style={{ ...card, padding: "24px 28px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", color: "var(--foreground)" }}>Distribution</h3>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={quadrantData} cx="50%" cy="50%" innerRadius={44} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                  {quadrantData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--card-border)', borderRadius: 12, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginTop: 16 }}>
            {quadrantData.map((q) => (
              <div key={q.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: q.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>{q.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div style={{ ...card, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--foreground)" }}>Tâches récentes</h3>
          <Link href="/tasks" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none",
          }}>
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {tasksLoading ? (
          <p style={{ color: "rgba(148,163,184,0.5)", textAlign: "center", padding: "32px 0", fontSize: 14 }}>Chargement...</p>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <AlertCircle size={36} color="rgba(148,163,184,0.3)" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "rgba(148,163,184,0.6)", fontWeight: 600, fontSize: 14 }}>Aucune tâche pour l'instant</p>
            <Link href="/tasks/new" style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
              padding: "10px 22px", borderRadius: 11,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              <Plus size={16} /> Créer une tâche
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.slice(0, 6).map((task) => {
              const qColors: Record<string, string> = { Q1: "#f87171", Q2: "#60a5fa", Q3: "#fb923c", Q4: "#9ca3af" };
              const meta = statusMeta[task.status] || statusMeta.TODO;
              const StatusIcon = meta.Icon;
              return (
                <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s", cursor: "pointer",
                  }}>
                    <div style={{
                      width: 3, height: 38, borderRadius: 4,
                      background: qColors[task.eisenhowerQuadrant] || "#94a3b8",
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px", color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, fontWeight: 500 }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Pas de date'}
                      </p>
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 8,
                      background: `${meta.color}15`, color: meta.color,
                    }}>
                      <StatusIcon size={13} strokeWidth={2.5} />
                      {meta.label}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
