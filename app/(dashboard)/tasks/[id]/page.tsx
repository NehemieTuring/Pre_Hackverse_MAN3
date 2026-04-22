"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Task } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft, Calendar, Clock, Target, CheckCircle2,
  Zap, CircleDashed, Play, Square, RotateCcw, Lightbulb,
  AlertTriangle, Info,
} from "lucide-react";

const QUADRANTS: Record<string, { label: string; desc: string; color: string; bg: string; border: string }> = {
  Q1: { label: "Critique",  desc: "Urgent & Important",       color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)" },
  Q2: { label: "Planifié",  desc: "Important, pas urgent",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.25)"  },
  Q3: { label: "Délégué",   desc: "Urgent, pas important",    color: "#fb923c", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.25)"  },
  Q4: { label: "Plus tard", desc: "Ni urgent ni important",   color: "#9ca3af", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)"  },
};

const STATUS_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  DONE:        { label: "Terminée",  color: "#10b981", Icon: CheckCircle2  },
  IN_PROGRESS: { label: "En cours",  color: "#f59e0b", Icon: Zap           },
  TODO:        { label: "À faire",   color: "#64748b", Icon: CircleDashed  },
};

const AI_TIPS: Record<string, string> = {
  Q1: "🚨 Priorité absolue ! Cette tâche est urgente ET importante. Traitez-la maintenant avant toute autre chose.",
  Q2: "📅 Planifiez cette tâche dans votre agenda. Elle est importante mais pas urgente — agissez avant qu'elle le devienne.",
  Q3: "🤝 Envisagez de déléguer ou de minimiser cette tâche. Elle est urgente mais son impact réel est limité.",
  Q4: "☁️ Cette tâche peut attendre. Évaluez si elle mérite vraiment votre attention ou si vous pouvez l'éliminer.",
};

function FocusTimer({ taskId, disabled = false }: { taskId: number, disabled?: boolean }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (disabled) return;
    try {
      const res = await api.post(`/tasks/${taskId}/timer/start`);
      setSessionId(res.data.id);
      setRunning(true);
      toast.success("Session focus démarrée !");
    } catch { toast.error("Impossible de démarrer le timer."); }
  };

  const handlePause = async () => {
    try {
      await api.post(`/tasks/${taskId}/timer/pause`);
      setRunning(false);
    } catch { toast.error("Erreur mise en pause."); }
  };

  const handleStop = async () => {
    try {
      await api.post(`/tasks/${taskId}/timer/stop`);
      setRunning(false);
      toast.success(`Session terminée : ${fmt(seconds)}`);
      setSeconds(0);
      setSessionId(null);
    } catch { toast.error("Erreur lors de l'arrêt du timer."); }
  };

  const handleReset = () => { 
    if (confirm("Réinitialiser le chrono ?")) {
      setRunning(false); 
      setSeconds(0); 
    }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Clock size={17} color="#60a5fa" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "#f1f5f9" }}>Session Focus</h3>
        {running && (
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
            background: "rgba(239,68,68,0.15)", color: "#f87171",
            animation: "pulse 2s infinite",
          }}>● LIVE</span>
        )}
      </div>

      {/* Timer display */}
      <div style={{
        textAlign: "center", margin: "0 0 24px",
        fontVariantNumeric: "tabular-nums",
      }}>
        <div style={{
          fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em",
          color: running ? "#60a5fa" : "#f8fafc",
          transition: "color 0.3s",
          fontFamily: "'Inter', monospace",
        }}>{fmt(seconds)}</div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10 }}>
        {!running ? (
          <button 
            onClick={handleStart} 
            disabled={disabled}
            style={{
              flex: 1, padding: "14px", borderRadius: 12, border: "none",
              background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: disabled ? "rgba(148,163,184,0.4)" : "#fff", fontWeight: 800, fontSize: 15,
              cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit", boxShadow: disabled ? "none" : "0 4px 20px rgba(59,130,246,0.35)",
            }}>
            <Play size={17} fill={disabled ? "rgba(148,163,184,0.4)" : "#fff"} /> {seconds > 0 ? "Reprendre" : "Démarrer"}
          </button>
        ) : (
          <div style={{ flex: 1, display: "flex", gap: 10 }}>
            <button onClick={handlePause} style={{
              flex: 1, padding: "14px", borderRadius: 12, border: "none",
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)" as any,
              color: "#f59e0b", fontWeight: 800, fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit",
            }}>
              <Pause size={17} fill="#f59e0b" /> Pause
            </button>
            <button onClick={handleStop} style={{
              padding: "14px 20px", borderRadius: 12, border: "none",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)" as any,
              color: "#f87171", fontWeight: 800, fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit",
            }}>
              <Square size={17} fill="#f87171" /> Stop
            </button>
          </div>
        )}
        <button onClick={handleReset} style={{
          width: 48, height: 48, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
        }}>
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

export default function TaskDetailsPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get(`/tasks/${params.id}`)
      .then(res => setTask(res.data))
      .catch(() => { toast.error("Tâche introuvable."); router.push("/tasks"); })
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    if (!task) return;
    setUpdating(true);
    try {
      // If marking as DONE, stop timer if running
      if (status === "DONE" && task.status === "IN_PROGRESS") {
        try { await api.post(`/tasks/${task.id}/timer/stop`); } catch {}
      }
      await api.patch(`/tasks/${task.id}/status`, null, { params: { status } });
      setTask({ ...task, status: status as any });
      toast.success(status === "DONE" ? "Tâche terminée ! 🎉" : "Statut mis à jour.");
    } catch { toast.error("Erreur de mise à jour."); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(59,130,246,0.2)", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!task) return null;

  const q = QUADRANTS[task.eisenhowerQuadrant] || QUADRANTS.Q4;
  const meta = STATUS_META[task.status] || STATUS_META.TODO;
  const StatusIcon = meta.Icon;

  return (
    <div style={{
      padding: "32px",
      maxWidth: 1100,
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "#f1f5f9",
    }}>
      {/* Back */}
      <Link href="/tasks" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 16px", borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(148,163,184,0.8)", fontSize: 14, fontWeight: 600,
        textDecoration: "none", marginBottom: 28,
      }}>
        <ChevronLeft size={16} /> Retour aux tâches
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* Left — Task details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Title card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "28px 32px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 120, height: 120,
              background: `radial-gradient(circle, ${q.color}18, transparent)`,
              borderRadius: "50%",
            }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: 0, color: "#f8fafc", flex: 1 }}>
                {task.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, background: `${meta.color}18`, border: `1px solid ${meta.color}35`, flexShrink: 0 }}>
                <StatusIcon size={14} color={meta.color} strokeWidth={2.5} />
                <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
              </div>
            </div>

            {/* Metadata row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {task.dueDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Calendar size={14} color="#60a5fa" />
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.6)", margin: 0 }}>Échéance</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                      {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
              {task.estimatedTimeMinutes && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Clock size={14} color="#f59e0b" />
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.6)", margin: 0 }}>Durée estimée</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{task.estimatedTimeMinutes} min</p>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 11, background: q.bg, border: `1px solid ${q.border}` }}>
                <Target size={14} color={q.color} />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.6)", margin: 0 }}>Quadrant</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: q.color, margin: 0 }}>{task.eisenhowerQuadrant} — {q.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "24px 28px",
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, margin: "0 0 14px", color: "#f1f5f9" }}>Description</h3>
            <p style={{ color: task.description ? "rgba(203,213,225,0.85)" : "rgba(100,116,139,0.6)", fontSize: 15, lineHeight: 1.7, margin: 0, fontWeight: 500, fontStyle: task.description ? "normal" : "italic" }}>
              {task.description || "Aucune description fournie."}
            </p>
          </div>

          {/* Status actions */}
          {task.status !== "DONE" && (
            <div style={{ display: "flex", gap: 12 }}>
              {task.status === "TODO" && (
                <button onClick={() => updateStatus("IN_PROGRESS")} disabled={updating} style={{
                  flex: 1, padding: "15px", borderRadius: 14, border: "1px solid rgba(245,158,11,0.3)",
                  background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 800, fontSize: 15,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit",
                }}>
                  <Zap size={18} /> Commencer
                </button>
              )}
              <button onClick={() => updateStatus("DONE")} disabled={updating} style={{
                flex: 1, padding: "15px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 800, fontSize: 15,
                cursor: updating ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit", boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
                opacity: updating ? 0.7 : 1,
              }}>
                <CheckCircle2 size={18} /> Marquer comme terminée
              </button>
            </div>
          )}
          {task.status === "DONE" && (
            <div style={{
              padding: "18px 24px", borderRadius: 14,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <CheckCircle2 size={22} color="#10b981" />
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: "#10b981", margin: 0 }}>Tâche terminée 🎉</p>
                <p style={{ fontSize: 12, color: "rgba(52,211,153,0.7)", margin: 0, fontWeight: 500 }}>Excellent travail !</p>
              </div>
              <button onClick={() => updateStatus("TODO")} style={{
                marginLeft: "auto", padding: "8px 16px", borderRadius: 9,
                background: "transparent", border: "1px solid rgba(16,185,129,0.25)",
                color: "rgba(52,211,153,0.8)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
              }}>
                Réouvrir
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <FocusTimer taskId={task.id} disabled={task.status === 'DONE'} />

          {/* AI Tip */}
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 20, padding: "22px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Lightbulb size={16} color="#a78bfa" />
              <h3 style={{ fontWeight: 800, fontSize: 14, margin: 0, color: "#c4b5fd" }}>Conseil Intelligent</h3>
            </div>
            <p style={{ fontSize: 13, color: "rgba(196,181,253,0.85)", lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
              {AI_TIPS[task.eisenhowerQuadrant] || AI_TIPS.Q4}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
