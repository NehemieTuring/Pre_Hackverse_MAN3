"use client";

import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useUnavailabilities } from "@/hooks/useUnavailabilities";
import api from "@/lib/api";
import { toast } from "sonner";
import { 
  Sparkles, Loader2, CalendarDays, Info, CheckCircle, 
  Clock, X, Plus, Trash2, Calendar as CalendarIcon, Target,
  ChevronLeft, ChevronRight, Settings, Search, MousePointer2
} from "lucide-react";
import { ScheduledTaskDTO, Task, Unavailability } from "@/lib/types";
import { ConfirmModal } from "@/components/ConfirmModal";

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const card = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: 24,
  boxShadow: "var(--card-shadow)",
};

export default function PlannerPage() {
  const { tasks, fetchTasks } = useTasks();
  const { unavailabilities, createUnavailability, deleteUnavailability, updateUnavailability } = useUnavailabilities();
  
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [proposedPlan, setProposedPlan] = useState<ScheduledTaskDTO[] | null>(null);
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [newFixed, setNewFixed] = useState({ title: "", start: "", end: "" });
  const [editingUnavail, setEditingUnavail] = useState<number | null>(null);
  const [unavailToDelete, setUnavailToDelete] = useState<number | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });

  useEffect(() => { setMounted(true); }, []);

  const currentWeekStart = useMemo(() => {
    const d = new Date(viewDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff)).setHours(0,0,0,0);
  }, [viewDate]);

  const weekDays = useMemo(() => {
    const list = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push(d);
    }
    return list;
  }, [currentWeekStart]);

  // ── CELL INTERACTION ─────────────────────────────────────────────
  const handleCellDoubleClick = (dayIdx: number, hourStr: string) => {
    const hour = parseInt(hourStr);
    const date = new Date(weekDays[dayIdx]);
    
    // Start of the hour
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    
    // End of the hour
    const end = new Date(date);
    end.setHours(hour + 1, 0, 0, 0);

    const formatForInput = (d: Date) => {
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    setNewFixed({
      title: "",
      start: formatForInput(start),
      end: formatForInput(end)
    });
    setEditingUnavail(null);
    setShowAddFixed(true);
  };

  const handleEditFixed = (u: Unavailability) => {
    const formatForInput = (dStr: string) => {
      const d = new Date(dStr);
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    setNewFixed({
      title: u.title,
      start: formatForInput(u.startTime),
      end: formatForInput(u.endTime)
    });
    setEditingUnavail(u.id);
    setShowAddFixed(true);
  };

  const handleAddFixed = async () => {
    if (!newFixed.title || !newFixed.start || !newFixed.end) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    try {
      if (editingUnavail) {
        await updateUnavailability(editingUnavail, {
          title: newFixed.title,
          startTime: newFixed.start,
          endTime: newFixed.end
        });
      } else {
        await createUnavailability({
          title: newFixed.title,
          startTime: newFixed.start,
          endTime: newFixed.end
        });
      }
      setNewFixed({ title: "", start: "", end: "" });
      setShowAddFixed(false);
      setEditingUnavail(null);
    } catch { toast.error("Erreur."); }
  };

  // ── REMAINDER LOGIC ──────────────────────────────────────────────
  const generatePlan = async () => {
    try {
      setLoading(true);
      const res = await api.post<ScheduledTaskDTO[]>("/planner/generate");
      setProposedPlan(res.data.filter(p => p.scheduledStart));
      toast.success("Planning généré !");
    } catch { toast.error("Erreur de génération."); }
    finally { setLoading(false); }
  };

  const handleApply = async () => {
    if (!proposedPlan) return;
    try {
      setApplying(true);
      const res = await api.post<number>("/planner/apply", proposedPlan);
      const count = res.data;
      toast.success(`Planning appliqué ! ${count} tâche(s) planifiée(s).`);
      setProposedPlan(null);
      await fetchTasks();
    } catch (err: any) { 
      console.error("Apply error:", err?.response?.data || err);
      toast.error("Erreur lors de l'application du planning."); 
    }
    finally { setApplying(false); }
  };

  const getCellContent = (dayIdx: number, hourStr: string) => {
    const hour = parseInt(hourStr);
    const dayDate = weekDays[dayIdx];
    const dateStart = new Date(dayDate).setHours(hour, 0, 0, 0);
    const dateEnd = new Date(dayDate).setHours(hour + 1, 0, 0, 0);

    const fixed = unavailabilities.find(u => {
      const uStart = new Date(u.startTime).getTime();
      const uEnd = new Date(u.endTime).getTime();
      return uStart < dateEnd && uEnd > dateStart;
    });
    if (fixed) return { type: 'FIXED', title: fixed.title, color: "#f59e0b", id: fixed.id };

    const prop = (proposedPlan || []).find(p => {
      if (!p.scheduledStart) return false;
      return new Date(p.scheduledStart).getTime() >= dateStart && new Date(p.scheduledStart).getTime() < dateEnd;
    });
    if (prop) return { type: 'PLAN', title: prop.title, color: "#10b981" };

    // Show persisted scheduled tasks (previously applied IA plans)
    const task = tasks.find(t => {
      if (!t.scheduledStart) return false;
      const tStart = new Date(t.scheduledStart).getTime();
      return tStart >= dateStart && tStart < dateEnd;
    });
    if (task) return { type: 'TASK', title: task.title, color: "#10b981" };

    return null;
  };

  if (!mounted) return null;
  const unscheduledTasks = tasks.filter(t => !t.scheduledStart && t.status !== 'DONE');

  return (
    <div style={{ padding: "24px 32px", maxWidth: "100%", margin: "0 auto", color: "var(--foreground)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
        
        <div>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>Votre Planning</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#818cf8" }}>{viewDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                <input type="month" value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`} onChange={(e) => setViewDate(new Date(e.target.value))} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", padding: "4px 8px", cursor: "pointer" }} />
              </div>
            </div>
            <div style={{ display: "flex", background: "var(--card)", borderRadius: 12, padding: 4 }}>
              <button onClick={() => setViewDate(new Date(viewDate.setDate(viewDate.getDate() - 7)))} style={{ background: "none", border: "none", color: "var(--foreground)", cursor: "pointer" }}><ChevronLeft /></button>
              <button onClick={() => setViewDate(new Date())} style={{ background: "none", border: "none", color: "var(--foreground)", fontWeight: 700, padding: "0 10px" }}>Aujourd&apos;hui</button>
              <button onClick={() => setViewDate(new Date(viewDate.setDate(viewDate.getDate() + 7)))} style={{ background: "none", border: "none", color: "var(--foreground)", cursor: "pointer" }}><ChevronRight /></button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 1000 }}>
                <thead>
                  <tr style={{ background: "var(--card)" }}>
                    <th style={{ width: 80, padding: "16px", color: "var(--muted)" }}>Heure</th>
                    {weekDays.map((d, i) => (
                      <th key={i} style={{ padding: "16px", textAlign: "left" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>{DAY_NAMES[i]}</p>
                        <p style={{ margin: 0, fontSize: 16 }}>{d.getDate()}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour, hIdx) => (
                    <tr key={hour} style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td style={{ textAlign: "center", color: "var(--muted)", fontSize: 11 }}>{hour}</td>
                      {DAY_NAMES.map((_, dIdx) => {
                        const content = getCellContent(dIdx, hour);
                        return (
                          <td 
                            key={dIdx} 
                            onDoubleClick={() => handleCellDoubleClick(dIdx, hour)}
                            style={{ padding: "2px", height: 72, borderLeft: "1px solid var(--card-border)", transition: "background 0.2s", cursor: "cell" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--nav-hover)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            {content && (
                              <div 
                                onClick={(e) => { 
                                  if (content.type === 'FIXED') {
                                    e.stopPropagation();
                                    handleEditFixed(unavailabilities.find(u => u.id === content.id)!);
                                  }
                                }}
                                style={{ height: "100%", borderRadius: 10, padding: "8px", background: `${content.color}15`, borderLeft: `4px solid ${content.color}`, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", cursor: content.type === 'FIXED' ? 'pointer' : 'default' }}>
                                <span style={{ fontSize: 9, color: content.color, fontWeight: 900 }}>{content.type === 'FIXED' ? "FIXE" : "IA"}</span>
                                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{content.title}</p>
                                {content.type === 'FIXED' && <button onClick={(e) => { e.stopPropagation(); setUnavailToDelete(content.id!); }} style={{ position: "absolute", top: 4, right: 4, background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><X size={10} /></button>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ ...card, padding: 24 }}>
            <h4 style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>ACTION</h4>
            <button onClick={generatePlan} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Planifier via l&apos;IA</button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 12, textAlign: "center" }}>💡 <b>Double-cliquez</b> sur une case vide pour ajouter un cours manuellement.</p>
          </div>
          <div style={{ ...card, padding: 24, flex: 1 }}>
            <h4 style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>À PLANIFIER ({unscheduledTasks.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {unscheduledTasks.map(t => (
                <div key={t.id} style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{t.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {showAddFixed && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--sidebar)", border: "1px solid var(--card-border)", borderRadius: 32, padding: 32, width: "100%", maxWidth: 450 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, color: "var(--foreground)" }}>Nouveau créneau fixe</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input value={newFixed.title} onChange={e => setNewFixed({...newFixed, title: e.target.value})} placeholder="Titre (ex: Cours de Maths)" style={{ padding: 14, borderRadius: 12, background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)", outline: "none" }} autoFocus />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input type="datetime-local" value={newFixed.start} onChange={e => setNewFixed({...newFixed, start: e.target.value})} style={{ flex: "1 1 180px", padding: 10, borderRadius: 10, background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)", outline: "none" }} />
                <input type="datetime-local" value={newFixed.end} onChange={e => setNewFixed({...newFixed, end: e.target.value})} style={{ flex: "1 1 180px", padding: 10, borderRadius: 10, background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)", outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={handleAddFixed} style={{ flex: 1, padding: 14, borderRadius: 14, background: "#3b82f6", color: "#fff", fontWeight: 800, border: "none", cursor: "pointer" }}>Enregistrer</button>
                <button onClick={() => setShowAddFixed(false)} style={{ padding: 14, borderRadius: 14, background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)", cursor: "pointer" }}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
