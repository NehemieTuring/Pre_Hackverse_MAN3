"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Plus, Calendar, Clock, Zap, Target } from "lucide-react";

const card = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: 20,
  boxShadow: "var(--card-shadow)",
} as const;

const inputStyle = (focused: boolean) => ({
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: focused ? "2px solid var(--accent)" : "2px solid var(--card-border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "all 0.2s",
});

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--muted)",
  marginBottom: 8,
};

const QUADRANTS = [
  { key: "Q1", label: "Critique", desc: "Urgent & Important", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
  { key: "Q2", label: "Planifié",  desc: "Important, pas urgent", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
  { key: "Q3", label: "Délégué",  desc: "Urgent, pas important", color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.25)" },
  { key: "Q4", label: "Plus tard", desc: "Ni urgent ni important", color: "#9ca3af", bg: "rgba(156,163,175,0.12)", border: "rgba(156,163,175,0.25)" },
];

export default function NewTaskPage() {
  const { createTask } = useTasks();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    estimatedTimeMinutes: 30,
    importance: 3,
    urgency: 3,
    eisenhowerQuadrant: "Q1",
  });

  const autoClassify = (importance: number, urgency: number) => {
    if (importance >= 4 && urgency >= 4) return "Q1";
    if (importance >= 4 && urgency < 4)  return "Q2";
    if (importance < 4  && urgency >= 4) return "Q3";
    return "Q4";
  };

  const updateSlider = (field: "importance" | "urgency", val: number) => {
    const updated = { ...form, [field]: val };
    updated.eisenhowerQuadrant = autoClassify(updated.importance, updated.urgency);
    setForm(updated);
  };

  const selectQuadrant = (q: string) => {
    let imp = form.importance;
    let urg = form.urgency;
    
    // Adjusted values to fit the selected quadrant
    if (q === "Q1") { imp = 5; urg = 5; }
    else if (q === "Q2") { imp = 5; urg = 2; }
    else if (q === "Q3") { imp = 2; urg = 5; }
    else if (q === "Q4") { imp = 2; urg = 2; }
    
    setForm({ ...form, eisenhowerQuadrant: q, importance: imp, urgency: urg });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Le titre est requis."); return; }
    setLoading(true);
    const success = await createTask(form);
    if (success) { toast.success("Tâche créée !"); router.push("/tasks"); }
    setLoading(false);
  };

  const selectedQ = QUADRANTS.find(q => q.key === form.eisenhowerQuadrant) || QUADRANTS[0];

  return (
    <div style={{
      padding: "32px",
      maxWidth: 760,
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "var(--foreground)",
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

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
        }}>
          <Plus size={28} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.04em", color: "var(--foreground)" }}>
            Nouvelle tâche
          </h1>
          <p style={{ color: "rgba(148,163,184,0.75)", fontSize: 14, margin: 0, fontWeight: 500 }}>
            Définissez votre prochaine mission
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Title */}
        <div style={{ ...card, padding: "24px" }}>
          <label style={labelStyle}>Titre de la tâche *</label>
          <input
            type="text"
            required
            placeholder="Que devez-vous accomplir ?"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onFocus={() => setFocused("title")}
            onBlur={() => setFocused(null)}
            style={inputStyle(focused === "title")}
          />
          <label style={{ ...labelStyle, marginTop: 18 }}>Description (optionnel)</label>
          <textarea
            placeholder="Détails supplémentaires..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            onFocus={() => setFocused("desc")}
            onBlur={() => setFocused(null)}
            rows={3}
            style={{
              ...inputStyle(focused === "desc"),
              resize: "vertical",
              minHeight: 80,
            }}
          />
        </div>

        {/* Date & Duration */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ ...card, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Calendar size={16} color="#60a5fa" />
              <label style={{ ...labelStyle, margin: 0 }}>Date limite</label>
            </div>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              onFocus={() => setFocused("date")}
              onBlur={() => setFocused(null)}
              style={inputStyle(focused === "date")}
            />
          </div>
          <div style={{ ...card, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={16} color="#f59e0b" />
              <label style={{ ...labelStyle, margin: 0 }}>Durée estimée</label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="number"
                min={1}
                max={480}
                value={form.estimatedTimeMinutes}
                onChange={e => setForm({ ...form, estimatedTimeMinutes: Number(e.target.value) })}
                onFocus={() => setFocused("dur")}
                onBlur={() => setFocused(null)}
                style={{ ...inputStyle(focused === "dur"), flex: 1 }}
              />
              <span style={{ color: "rgba(148,163,184,0.7)", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>min</span>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ ...card, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <Zap size={16} color="#8b5cf6" />
            <h3 style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>Évaluation</h3>
          </div>
          {[
            { key: "importance", label: "Impact", value: form.importance, color: "#3b82f6" },
            { key: "urgency",  label: "Urgence", value: form.urgency,  color: "#f87171" },
          ].map(({ key, label, value, color }) => (
            <div key={key} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <label style={labelStyle}>{label}</label>
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}/5</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => updateSlider(key as "importance" | "urgency", n)}
                    style={{
                      flex: 1, height: 36, borderRadius: 10, border: "none",
                      background: n <= value ? color : "var(--background)",
                      cursor: "pointer", transition: "all 0.15s",
                      opacity: n <= value ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quadrant selector */}
        <div style={{ ...card, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Target size={16} color="#10b981" />
            <h3 style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>Quadrant Eisenhower</h3>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(148,163,184,0.6)", fontWeight: 500 }}>
              Auto-détecté selon l'évaluation
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {QUADRANTS.map(q => (
              <button
                key={q.key} type="button"
                onClick={() => selectQuadrant(q.key)}
                style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: form.eisenhowerQuadrant === q.key ? q.bg : "rgba(255,255,255,0.03)",
                  border: form.eisenhowerQuadrant === q.key
                    ? `1px solid ${q.border}`
                    : "1px solid rgba(255,255,255,0.06)" as any,
                  cursor: "pointer", textAlign: "left" as const, transition: "all 0.18s",
                  fontFamily: "inherit",
                }}>
                <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 3px", color: form.eisenhowerQuadrant === q.key ? q.color : "#94a3b8" }}>
                  {q.label}
                </p>
                <p style={{ fontSize: 11, margin: 0, color: "rgba(148,163,184,0.65)", fontWeight: 500 }}>{q.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "18px", borderRadius: 16, border: "none",
            background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff", fontSize: 17, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {loading ? (
            <span style={{ display: "inline-block", width: 18, height: 18, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          ) : <Plus size={20} strokeWidth={2.5} />}
          {loading ? "Création..." : "Créer la tâche"}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
