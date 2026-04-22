"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useTasks } from "@/hooks/useTasks";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, Zap, Target, BarChart3 } from "lucide-react";

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
} as const;

interface Stats {
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  averageFocusMinutes: number;
  tasksByQuadrant: Record<string, number>;
  tasksByDay?: Record<string, number>;
}

export default function StatisticsPage() {
  const { tasks } = useTasks();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics")
      .then(res => setStats(res.data))
      .catch(() => {
        // Fallback: compute from tasks
        const completed = tasks.filter(t => t.status === "DONE").length;
        setStats({
          completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
          totalTasks: tasks.length,
          completedTasks: completed,
          averageFocusMinutes: 0,
          tasksByQuadrant: {
            Q1: tasks.filter(t => t.eisenhowerQuadrant === "Q1").length,
            Q2: tasks.filter(t => t.eisenhowerQuadrant === "Q2").length,
            Q3: tasks.filter(t => t.eisenhowerQuadrant === "Q3").length,
            Q4: tasks.filter(t => t.eisenhowerQuadrant === "Q4").length,
          },
        });
      })
      .finally(() => setLoading(false));
  }, [tasks]);

  const quadrantData = [
    { name: "Critique", value: stats?.tasksByQuadrant?.Q1 ?? 0, color: "#f87171" },
    { name: "Planifié",  value: stats?.tasksByQuadrant?.Q2 ?? 0, color: "#60a5fa" },
    { name: "Délégué",  value: stats?.tasksByQuadrant?.Q3 ?? 0, color: "#fb923c" },
    { name: "Plus tard", value: stats?.tasksByQuadrant?.Q4 ?? 0, color: "#9ca3af" },
  ];

  // Build daily data from tasks
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const dailyData = days.map((day, i) => ({
    day,
    done: tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate).getDay();
      const mapped = d === 0 ? 6 : d - 1;
      return mapped === i && t.status === "DONE";
    }).length,
    total: tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate).getDay();
      const mapped = d === 0 ? 6 : d - 1;
      return mapped === i;
    }).length,
  }));

  const kpis = [
    { label: "Taux de complétion", value: `${stats?.completionRate ?? 0}%`, Icon: Target, accent: "#10b981", bg: "rgba(16,185,129,0.12)" },
    { label: "Tâches totales", value: stats?.totalTasks ?? 0, Icon: BarChart3, accent: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { label: "Terminées", value: stats?.completedTasks ?? 0, Icon: CheckCircle2, accent: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    { label: "Focus moyen (min)", value: stats?.averageFocusMinutes ?? 0, Icon: Clock, accent: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ];

  return (
    <div style={{
      padding: "32px",
      maxWidth: 1280,
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "#f1f5f9",
      display: "flex",
      flexDirection: "column",
      gap: 28,
    }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px", color: "#f8fafc" }}>
          Statistiques
        </h1>
        <p style={{ color: "rgba(148,163,184,0.8)", fontSize: 15, margin: 0, fontWeight: 500 }}>
          Analyse de votre productivité en temps réel.
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, padding: "22px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, background: k.bg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <k.Icon size={22} color={k.accent} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(148,163,184,0.65)", margin: "0 0 3px" }}>
                {k.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, margin: 0, color: k.accent, letterSpacing: "-0.03em" }}>
                {loading ? "—" : k.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Area chart — daily */}
        <div style={{ ...card, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <TrendingUp size={18} color="#60a5fa" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>Activité hebdomadaire</h3>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13 }} itemStyle={{ color: "#fff" }} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#3b82f6" strokeWidth={2} fill="url(#gradTotal)" />
                <Area type="monotone" dataKey="done" name="Terminées" stroke="#10b981" strokeWidth={2} fill="url(#gradDone)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart — quadrants */}
        <div style={{ ...card, padding: "24px 28px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", color: "#f1f5f9" }}>Par quadrant</h3>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={quadrantData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                  {quadrantData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginTop: 14 }}>
            {quadrantData.map((q) => (
              <div key={q.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: q.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(148,163,184,0.8)" }}>
                  {q.name} ({q.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart — quadrant comparison */}
      <div style={{ ...card, padding: "24px 28px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 24px", color: "#f1f5f9" }}>Tâches par quadrant Eisenhower</h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quadrantData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="value" name="Tâches" radius={[8, 8, 0, 0]}>
                {quadrantData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
