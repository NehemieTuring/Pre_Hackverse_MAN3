"use client";

import { useTasks } from "@/hooks/useTasks";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Play, Pause, Square, LayoutGrid, List as ListIcon, AlertCircle, Eye } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { Task } from "@/lib/types";

// ── Per-row timer ────────────────────────────────────────────────
function RowTimer({ taskId, initialRunning = false, disabled = false }: { taskId: number, initialRunning?: boolean, disabled?: boolean }) {
  const [running, setRunning] = useState(initialRunning);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If running, start local increment
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    try {
      if (!running) {
        await api.post(`/tasks/${taskId}/timer/start`);
        setRunning(true);
      } else {
        await api.post(`/tasks/${taskId}/timer/pause`);
        setRunning(false);
      }
    } catch {
      toast.error("Erreur avec le chronomètre.");
    }
  };

  const handleStop = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/tasks/${taskId}/timer/stop`);
      setRunning(false);
      toast.success(`Session terminée : ${fmt(seconds)}`);
      setSeconds(0);
    } catch {
      toast.error("Erreur d'arrêt du chrono.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={e => e.preventDefault()}>
      <button 
        onClick={handleToggle} 
        disabled={disabled}
        style={{
          width: 28, height: 28, borderRadius: 6, border: "none",
          background: disabled ? "rgba(255,255,255,0.03)" : running ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.12)",
          cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          opacity: disabled ? 0.3 : 1,
        }}>
        {running
          ? <Pause size={12} color="#f59e0b" fill="#f59e0b" />
          : <Play size={12} color={disabled ? "#94a3b8" : "#60a5fa"} fill={disabled ? "#475569" : "#60a5fa"} />}
      </button>
      
      {seconds > 0 && (
        <button onClick={handleStop} style={{
          width: 28, height: 28, borderRadius: 6, border: "none",
          background: "rgba(239,68,68,0.12)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Square size={10} color="#f87171" fill="#f87171" />
        </button>
      )}

      <span style={{
        fontVariantNumeric: "tabular-nums", fontSize: 13, fontWeight: 700,
        color: running ? "#60a5fa" : "rgba(148,163,184,0.6)",
        letterSpacing: "0.04em",
      }}>{fmt(seconds)}</span>
    </div>
  );
}

// ── Checkbox circle ──────────────────────────────────────────────
function CheckCircle({ done, onChange }: { done: boolean; onChange: () => void }) {
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onChange(); }}
      style={{
        width: 24, height: 24, borderRadius: "50%", cursor: "pointer",
        background: done ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
        border: done ? "none" : "2px solid rgba(255,255,255,0.2)" as any,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: done ? "0 2px 10px rgba(16,185,129,0.4)" : "none",
        transition: "all 0.2s", flexShrink: 0,
      }}
    >
      {done && (
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5L5.5 10L11 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

const Q_META: Record<string, { label: string; desc: string; color: string; bg: string; border: string }> = {
  Q1: { label: "Critique",  desc: "Urgent & Important",      color: "#f87171", bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.22)" },
  Q2: { label: "Planifié",  desc: "Important, pas urgent",   color: "#60a5fa", bg: "rgba(96,165,250,0.08)",   border: "rgba(96,165,250,0.22)"  },
  Q3: { label: "Délégué",   desc: "Urgent, pas important",   color: "#fb923c", bg: "rgba(251,146,60,0.08)",   border: "rgba(251,146,60,0.22)"  },
  Q4: { label: "Plus tard", desc: "Ni urgent ni important",  color: "#9ca3af", bg: "rgba(156,163,175,0.06)",  border: "rgba(156,163,175,0.18)" },
};

const FILTERS = [
  { key: "ALL", label: "Toutes" },
  { key: "TODO", label: "À faire" },
  { key: "IN_PROGRESS", label: "En cours" },
  { key: "DONE", label: "Terminées" },
];

export default function TasksPage() {
  const { tasks, loading, fetchTasks } = useTasks();
  const [view, setView] = useState<"list" | "matrix">("list");
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);
  const activeTasks = filtered.filter(t => t.status !== "DONE");
  const doneTasks = filtered.filter(t => t.status === "DONE");

  const toggleDone = async (task: Task) => {
    const next = task.status === "DONE" ? "TODO" : "DONE";
    try {
      // If marking as DONE, stop timer first
      if (next === "DONE" && task.status === "IN_PROGRESS") {
        try { await api.post(`/tasks/${task.id}/timer/stop`); } catch {}
      }
      await api.patch(`/tasks/${task.id}/status`, null, { params: { status: next } });
      fetchTasks();
    } catch { toast.error("Erreur de mise à jour."); }
  };

  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      fetchTasks();
      toast.success("Tâche supprimée.");
      setTaskToDelete(null);
    } catch { toast.error("Impossible de supprimer."); }
    finally { setIsDeleting(false); }
  };

  return (
    <div style={{
      padding: "32px", maxWidth: 1100, margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif", color: "#f1f5f9",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.04em", color: "#f8fafc" }}>Mes Tâches</h1>
          <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 13, margin: 0, fontWeight: 500 }}>
            {loading ? "Chargement..." : `${activeTasks.length} active${activeTasks.length > 1 ? "s" : ""} · ${doneTasks.length} terminée${doneTasks.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/tasks/new" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "10px 20px", borderRadius: 10,
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
        }}>
          <Plus size={16} strokeWidth={2.5} /> Nouvelle tâche
        </Link>
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 4, gap: 4 }}>
          {([["list", "Liste", ListIcon], ["matrix", "Matrice", LayoutGrid]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setView(id)} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 9, border: "none",
              background: view === id ? "rgba(59,130,246,0.2)" : "transparent",
              color: view === id ? "#60a5fa" : "rgba(148,163,184,0.7)",
              fontWeight: view === id ? 700 : 500, fontSize: 13,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>
              <Icon size={14} strokeWidth={view === id ? 2.5 : 1.8} /> {label}
            </button>
          ))}
        </div>

        {view === "list" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                background: filter === f.key ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
                border: filter === f.key ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.07)" as any,
                color: filter === f.key ? "#60a5fa" : "rgba(148,163,184,0.7)",
                fontWeight: filter === f.key ? 700 : 500, fontSize: 12,
                fontFamily: "inherit", transition: "all 0.15s",
              }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(59,130,246,0.2)", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : view === "list" ? (
        filtered.length === 0 ? <EmptyState /> : (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "48px 1fr 120px 140px 180px 80px",
              padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)",
            }}>
              {["Fini", "Titre", "Quadrant", "Statut", "Chrono", "Actions"].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(100,116,139,0.5)" }}>{h}</div>
              ))}
            </div>

            {[...activeTasks, ...doneTasks].map((task, i, arr) => {
              const done = task.status === "DONE";
              const qm = Q_META[task.eisenhowerQuadrant] || Q_META.Q4;
              return (
                <div key={task.id} style={{
                  display: "grid", gridTemplateColumns: "48px 1fr 120px 140px 180px 80px",
                  padding: "14px 20px", alignItems: "center",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: done ? "rgba(16,185,129,0.03)" : "transparent",
                  transition: "background 0.15s",
                }}>
                  <div><CheckCircle done={done} onChange={() => toggleDone(task)} /></div>
                  <div style={{ paddingRight: 16, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: 14, margin: 0,
                      color: done ? "rgba(148,163,184,0.3)" : "#f1f5f9",
                      textDecoration: done ? "line-through" : "none",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{task.title}</p>
                    {task.dueDate && <p style={{ fontSize: 10, color: "rgba(100,116,139,0.5)", margin: "2px 0 0" }}>{new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>}
                  </div>
                  <div><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: `${qm.color}15`, color: qm.color }}>{qm.label}</span></div>
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: done ? "#10b981" : task.status === "IN_PROGRESS" ? "#f59e0b" : "rgba(100,116,139,0.6)" }}>{done ? "✓ Terminée" : task.status === "IN_PROGRESS" ? "⚡ En cours" : "○ À faire"}</span></div>
                  <RowTimer taskId={task.id} initialRunning={task.status === "IN_PROGRESS"} disabled={done} />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link href={`/tasks/${task.id}`} title="Détails" style={{
                      width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#94a3b8", transition: "all 0.2s",
                    }}>
                      <Eye size={14} />
                    </Link>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTaskToDelete(task.id); }} 
                      style={{
                        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                        background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" as any,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      <Trash2 size={13} color="#f87171" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        tasks.length === 0 ? <EmptyState /> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {(["Q1", "Q2", "Q3", "Q4"] as const).map(qKey => {
              const qm = Q_META[qKey];
              const qTasks = tasks.filter(t => t.eisenhowerQuadrant === qKey);
              return (
                <div key={qKey} style={{ borderRadius: 20, background: qm.bg, border: `1px solid ${qm.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${qm.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><h3 style={{ fontWeight: 900, fontSize: 15, margin: 0, color: qm.color }}>{qm.label}</h3><p style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", margin: 0 }}>{qm.desc}</p></div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: qm.color }}>{qTasks.length}</span>
                  </div>
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 100 }}>
                    {qTasks.length === 0 ? <p style={{ color: "rgba(148,163,184,0.2)", fontSize: 12, textAlign: "center", padding: "16px 0" }}>Aucune tâche</p> : qTasks.map(task => (
                      <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <CheckCircle done={task.status === "DONE"} onChange={() => toggleDone(task)} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: task.status === "DONE" ? "rgba(148,163,184,0.3)" : "#f1f5f9", textDecoration: task.status === "DONE" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      <ConfirmModal 
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer la tâche"
        message="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
        confirmText="Supprimer"
        isDestructive
        loading={isDeleting}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 40px", gap: 14, textAlign: "center",
      background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <AlertCircle size={40} color="rgba(148,163,184,0.15)" />
      <p style={{ fontWeight: 700, fontSize: 15, color: "rgba(148,163,184,0.4)", margin: 0 }}>Rien à afficher ici</p>
      <Link href="/tasks/new" style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Créer une tâche</Link>
    </div>
  );
}
