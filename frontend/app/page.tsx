import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const CATEGORIES = ["Devoir", "Examen", "Projet", "Lecture", "TD", "TP", "Autre"];
const PRIORITIES = {
  1: { label: "Faible", color: "#059669", bg: "#d1fae5", border: "#6ee7b7" },
  2: { label: "Moyenne", color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
  3: { label: "Haute", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
};

const INITIAL_TASKS = [
  { id: 1, title: "Rapport BD – Modèle entité-association", subject: "Bases de données", category: "Projet", deadline: "2026-04-25", priority: 3, estimatedHours: 4, completed: false },
  { id: 2, title: "TP Réseaux – Subnetting VLSM", subject: "Réseaux", category: "TP", deadline: "2026-04-23", priority: 2, estimatedHours: 2, completed: false },
  { id: 3, title: "Révisions Génie Logiciel – UML", subject: "Génie Logiciel", category: "Examen", deadline: "2026-04-28", priority: 3, estimatedHours: 3, completed: true },
  { id: 4, title: "Exercices algorithmes – complexité", subject: "Algorithmique", category: "TD", deadline: "2026-04-22", priority: 2, estimatedHours: 1.5, completed: false },
  { id: 5, title: "Lecture – Patterns de conception", subject: "Génie Logiciel", category: "Lecture", deadline: "2026-04-30", priority: 1, estimatedHours: 2, completed: false },
  { id: 6, title: "Mini-projet C – Gestion processus", subject: "Systèmes", category: "Projet", deadline: "2026-04-27", priority: 2, estimatedHours: 3, completed: false },
];

function computeScore(task) {
  if (task.completed) return 0;
  const today = new Date();
  const deadline = new Date(task.deadline);
  const daysLeft = Math.max((deadline - today) / (1000 * 60 * 60 * 24), 0.1);
  const urgency = Math.round((10 / daysLeft) * 10) / 10;
  const priorityWeight = task.priority * 3;
  const sizeWeight = Math.round(task.estimatedHours * 0.5 * 10) / 10;
  return Math.round((urgency + priorityWeight + sizeWeight) * 10) / 10;
}

function Badge({ priority }) {
  const p = PRIORITIES[priority];
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: p.bg, color: p.color, fontWeight: 600, border: `1px solid ${p.border}`, whiteSpace: "nowrap" }}>
      {p.label}
    </span>
  );
}

function ScoreBar({ score }) {
  const pct = Math.min(Math.round(score * 3), 100);
  const color = score > 15 ? "#dc2626" : score > 8 ? "#d97706" : "#059669";
  return (
    <div style={{ height: 3, borderRadius: 3, background: "#f1f5f9", marginTop: 5, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.3s" }} />
    </div>
  );
}

export default function StudyFlow() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [tab, setTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [filterCat, setFilterCat] = useState("Toutes");
  const [form, setForm] = useState({ title: "", subject: "", category: "Devoir", deadline: "", priority: 2, estimatedHours: 1 });

  const today = new Date();

  const scored = useMemo(() =>
    tasks.map(t => ({ ...t, autoScore: computeScore(t) }))
      .sort((a, b) => b.autoScore - a.autoScore),
    [tasks]
  );

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  const urgent = scored.filter(t => !t.completed && t.autoScore > 12);
  const totalHours = pending.reduce((s, t) => s + t.estimatedHours, 0);

  function openAdd() {
    setEditTask(null);
    setForm({ title: "", subject: "", category: "Devoir", deadline: "", priority: 2, estimatedHours: 1 });
    setShowModal(true);
  }
  function openEdit(t) {
    setEditTask(t);
    setForm({ title: t.title, subject: t.subject, category: t.category, deadline: t.deadline, priority: t.priority, estimatedHours: t.estimatedHours });
    setShowModal(true);
  }
  function save() {
    if (!form.title.trim() || !form.deadline) return;
    if (editTask) {
      setTasks(tasks.map(t => t.id === editTask.id ? { ...t, ...form } : t));
    } else {
      setTasks([...tasks, { ...form, id: Date.now(), completed: false }]);
    }
    setShowModal(false);
  }
  function remove(id) { setTasks(tasks.filter(t => t.id !== id)); }
  function toggle(id) { setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); }

  function dayLabel(dateStr) {
    const d = new Date(dateStr);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)}j dépassé`, color: "#dc2626" };
    if (diff === 0) return { text: "Aujourd'hui !", color: "#dc2626" };
    if (diff === 1) return { text: "Demain", color: "#d97706" };
    return { text: `J-${diff}`, color: diff <= 3 ? "#d97706" : "#6b7280" };
  }

  async function fetchSuggestions() {
    setAiLoading(true);
    setAiResult(null);
    const list = scored.filter(t => !t.completed).map(t =>
      `- "${t.title}" | ${t.subject} | ${t.category} | échéance: ${t.deadline} | priorité: ${PRIORITIES[t.priority].label} | ~${t.estimatedHours}h | score: ${t.autoScore}`
    ).join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es un assistant de gestion du temps pour un étudiant en Génie Informatique. Réponds UNIQUEMENT en JSON valide sans backticks ni markdown, avec exactement cette structure: {"resume":"string","ordre":[{"tache":"string","conseil":"string"}],"astuces":["string","string","string"],"pomodoro":{"taches_prioritaires":["string"],"sessions":2}}`,
          messages: [{ role: "user", content: `Tâches en attente classées par score:\n${list}\n\nPropose un plan pour aujourd'hui avec ordre optimal et conseils.` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      setAiResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch {
      setAiResult({ resume: "Erreur de connexion à l'IA. Vérifie ta connexion.", ordre: [], astuces: [], pomodoro: null });
    }
    setAiLoading(false);
  }

  const statsByCat = CATEGORIES.map(c => ({ name: c, total: tasks.filter(t => t.category === c).length, done: tasks.filter(t => t.category === c && t.completed).length })).filter(s => s.total > 0);
  const statsByPrio = [
    { name: "Haute", value: pending.filter(t => t.priority === 3).length, color: "#ef4444" },
    { name: "Moyenne", value: pending.filter(t => t.priority === 2).length, color: "#f59e0b" },
    { name: "Faible", value: pending.filter(t => t.priority === 1).length, color: "#10b981" },
  ].filter(s => s.value > 0);
  const completionPct = tasks.length ? Math.round(done.length / tasks.length * 100) : 0;

  const filteredTasks = filterCat === "Toutes" ? scored : scored.filter(t => t.category === filterCat);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; }
    .sf-app { font-family: 'DM Sans', -apple-system, sans-serif; background: #f6f5f2; min-height: 100vh; color: #1a1a1a; }
    .sf-header { background: #18181b; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
    .sf-logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .sf-logo span { color: #818cf8; }
    .sf-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
    .sf-tabs { background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; padding: 0 20px; gap: 2px; overflow-x: auto; }
    .sf-tab { padding: 11px 14px; font-size: 13px; font-weight: 500; color: #6b7280; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: color 0.15s; }
    .sf-tab.active { color: #6366f1; border-bottom-color: #6366f1; font-weight: 600; }
    .sf-content { padding: 20px; max-width: 820px; margin: 0 auto; }
    .sf-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
    .sf-metric { background: #fff; border-radius: 10px; padding: 14px 12px; border: 1px solid #e5e7eb; text-align: center; }
    .sf-metric-val { font-size: 26px; font-weight: 700; font-family: 'Syne', sans-serif; line-height: 1; margin-bottom: 4px; }
    .sf-metric-lbl { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
    .sf-section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .sf-section-title { font-size: 13px; font-weight: 600; color: #374151; }
    .sf-card { background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; margin-bottom: 8px; overflow: hidden; }
    .sf-task { display: flex; align-items: center; gap: 10px; padding: 12px 14px; transition: background 0.1s; }
    .sf-task:hover { background: #fafafa; }
    .sf-task-title { font-size: 13px; font-weight: 500; }
    .sf-task-meta { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .sf-rank { width: 22px; height: 22px; border-radius: 50%; background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .sf-btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: transform 0.1s, opacity 0.1s; }
    .sf-btn:hover { opacity: 0.9; }
    .sf-btn:active { transform: scale(0.97); }
    .sf-btn-primary { background: #6366f1; color: #fff; }
    .sf-btn-ghost { background: transparent; color: #6b7280; border: 1px solid #e5e7eb; }
    .sf-btn-danger { background: #fee2e2; color: #dc2626; }
    .sf-btn-sm { padding: 5px 10px; font-size: 12px; }
    .sf-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 200; }
    .sf-modal { background: #fff; border-radius: 16px; padding: 24px; width: 92%; max-width: 460px; }
    .sf-modal h3 { font-size: 16px; font-weight: 700; margin-bottom: 18px; }
    .sf-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 5px; display: block; }
    .sf-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-family: 'DM Sans', sans-serif; margin-bottom: 14px; transition: border-color 0.15s; outline: none; }
    .sf-input:focus { border-color: #818cf8; }
    .sf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .sf-chip { display: inline-block; font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #f3f4f6; color: #6b7280; font-weight: 500; }
    .sf-ai-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
    .sf-progress-bg { width: 100%; height: 6px; background: #f1f5f9; border-radius: 6px; overflow: hidden; margin-top: 8px; }
    .sf-progress-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 0.5s; }
    .sf-day-hdr { font-size: 12px; font-weight: 700; color: #374151; margin: 14px 0 6px; text-transform: capitalize; }
    .sf-day-empty { font-size: 12px; color: #d1d5db; padding: 8px 12px; background: #fafafa; border-radius: 8px; border: 1px dashed #e5e7eb; }
    .sf-filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .sf-filter-chip { padding: 5px 12px; border-radius: 20px; border: 1px solid #e5e7eb; font-size: 12px; cursor: pointer; background: #fff; color: #6b7280; font-family: 'DM Sans', sans-serif; transition: all 0.1s; }
    .sf-filter-chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }
    .sf-conseil { font-size: 12px; color: #4b5563; padding: 6px 0 6px 12px; border-left: 3px solid #818cf8; margin-bottom: 8px; }
    .sf-astuce { font-size: 13px; color: #374151; padding: 10px 14px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; display: flex; gap: 8px; align-items: flex-start; }
    checkbox { accent-color: #6366f1; }
  `;

  const TABS = [
    ["dashboard", "📊 Tableau de bord"],
    ["tasks", "✅ Tâches"],
    ["planner", "📅 Planificateur"],
    ["stats", "📈 Statistiques"],
    ["ai", "🤖 Suggestions IA"],
  ];

  return (
    <div className="sf-app">
      <style>{css}</style>

      {/* Header */}
      <div className="sf-header">
        <div>
          <div className="sf-logo">Study<span>Flow</span></div>
          <div className="sf-sub">Gestion intelligente du temps étudiant</div>
        </div>
        <button className="sf-btn sf-btn-primary" onClick={openAdd}>+ Nouvelle tâche</button>
      </div>

      {/* Tabs */}
      <div className="sf-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={`sf-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div className="sf-content">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <div className="sf-metrics">
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#6366f1" }}>{pending.length}</div>
                <div className="sf-metric-lbl">En cours</div>
              </div>
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#dc2626" }}>{urgent.length}</div>
                <div className="sf-metric-lbl">Urgentes</div>
              </div>
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#059669" }}>{done.length}</div>
                <div className="sf-metric-lbl">Terminées</div>
              </div>
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#d97706" }}>{totalHours.toFixed(1)}h</div>
                <div className="sf-metric-lbl">Charge totale</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="sf-card" style={{ padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Progression globale</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>{completionPct}%</span>
              </div>
              <div className="sf-progress-bg">
                <div className="sf-progress-fill" style={{ width: `${completionPct}%` }} />
              </div>
            </div>

            <div className="sf-section-hdr">
              <span className="sf-section-title">🔥 À traiter en priorité</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Algorithme de priorisation automatique</span>
            </div>
            {scored.filter(t => !t.completed).slice(0, 5).map((task, i) => {
              const dl = dayLabel(task.deadline);
              return (
                <div className="sf-card" key={task.id}>
                  <div className="sf-task">
                    <div className="sf-rank">{i + 1}</div>
                    <input type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} style={{ accentColor: "#6366f1", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span className="sf-task-title">{task.title}</span>
                        <Badge priority={task.priority} />
                      </div>
                      <div className="sf-task-meta">
                        {task.subject} · <span style={{ color: dl.color, fontWeight: 600 }}>{dl.text}</span> · ~{task.estimatedHours}h
                      </div>
                      <ScoreBar score={task.autoScore} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc", minWidth: 36, textAlign: "right" }}>
                      {task.autoScore}pts
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── TÂCHES ── */}
        {tab === "tasks" && (
          <>
            <div className="sf-section-hdr" style={{ marginBottom: 12 }}>
              <span className="sf-section-title">Toutes les tâches ({tasks.length})</span>
              <button className="sf-btn sf-btn-primary sf-btn-sm" onClick={openAdd}>+ Ajouter</button>
            </div>
            <div className="sf-filter-row">
              {["Toutes", ...CATEGORIES].map(c => (
                <button key={c} className={`sf-filter-chip${filterCat === c ? " active" : ""}`} onClick={() => setFilterCat(c)}>{c}</button>
              ))}
            </div>
            {filteredTasks.map(task => {
              const dl = dayLabel(task.deadline);
              return (
                <div className="sf-card" key={task.id} style={{ opacity: task.completed ? 0.55 : 1 }}>
                  <div className="sf-task">
                    <input type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} style={{ accentColor: "#6366f1", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span className="sf-task-title" style={{ textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</span>
                        <Badge priority={task.priority} />
                        <span className="sf-chip">{task.category}</span>
                      </div>
                      <div className="sf-task-meta">
                        {task.subject} · <span style={{ color: dl.color, fontWeight: 600 }}>{dl.text}</span> · ~{task.estimatedHours}h
                      </div>
                      {!task.completed && <ScoreBar score={task.autoScore} />}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button className="sf-btn sf-btn-ghost sf-btn-sm" onClick={() => openEdit(task)}>✏️</button>
                      <button className="sf-btn sf-btn-danger sf-btn-sm" onClick={() => remove(task.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
                Aucune tâche dans cette catégorie.
              </div>
            )}
          </>
        )}

        {/* ── PLANIFICATEUR ── */}
        {tab === "planner" && (
          <>
            <div className="sf-section-hdr">
              <span className="sf-section-title">📅 Vue hebdomadaire</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>7 prochains jours</span>
            </div>
            {Array.from({ length: 8 }, (_, i) => {
              const day = new Date(today);
              day.setDate(today.getDate() + i);
              const ds = day.toISOString().split("T")[0];
              const dayTasks = scored.filter(t => t.deadline === ds);
              const isToday = i === 0;
              const label = isToday ? "Aujourd'hui" : i === 1 ? "Demain" : day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
              const totalH = dayTasks.filter(t => !t.completed).reduce((s, t) => s + t.estimatedHours, 0);
              return (
                <div key={ds} style={{ marginBottom: 14 }}>
                  <div className="sf-day-hdr" style={{ color: isToday ? "#6366f1" : "#374151", display: "flex", justifyContent: "space-between" }}>
                    <span>{label}</span>
                    {dayTasks.length > 0 && <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 11 }}>~{totalH.toFixed(1)}h estimées</span>}
                  </div>
                  {dayTasks.length === 0
                    ? <div className="sf-day-empty">Aucune échéance ce jour</div>
                    : dayTasks.map(t => {
                      return (
                        <div className="sf-card" key={t.id} style={{ marginBottom: 6, border: isToday ? "1px solid #c7d2fe" : "1px solid #e5e7eb" }}>
                          <div className="sf-task">
                            <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} style={{ accentColor: "#6366f1", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                                <span className="sf-task-title" style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</span>
                                <Badge priority={t.priority} />
                              </div>
                              <div className="sf-task-meta">{t.subject} · ~{t.estimatedHours}h</div>
                            </div>
                            {!t.completed && <span className="sf-chip">{t.autoScore}pts</span>}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              );
            })}
          </>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && (
          <>
            <div className="sf-metrics" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#6366f1" }}>{completionPct}%</div>
                <div className="sf-metric-lbl">Complétion</div>
              </div>
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#d97706" }}>{totalHours.toFixed(1)}h</div>
                <div className="sf-metric-lbl">Charge restante</div>
              </div>
              <div className="sf-metric">
                <div className="sf-metric-val" style={{ color: "#dc2626" }}>{urgent.length}</div>
                <div className="sf-metric-lbl">Urgentes</div>
              </div>
            </div>

            <div className="sf-card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Tâches par catégorie</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={statsByCat} barGap={2} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="total" name="Total" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="done" name="Terminées" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#c7d2fe", borderRadius: 2, marginRight: 4 }} />Total</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#6366f1", borderRadius: 2, marginRight: 4 }} />Terminées</span>
              </div>
            </div>

            <div className="sf-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Répartition des priorités (tâches actives)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={statsByPrio} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={4}>
                      {statsByPrio.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  {statsByPrio.map(p => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13 }}>{p.name} : <strong>{p.value}</strong></span>
                    </div>
                  ))}
                  {statsByPrio.length === 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>Aucune tâche active</span>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SUGGESTIONS IA ── */}
        {tab === "ai" && (
          <>
            <div className="sf-ai-box">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 24 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6" }}>Assistant IA – Suggestions personnalisées</div>
                  <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 3 }}>
                    Analyse vos tâches, échéances, priorités et charge estimée pour proposer un plan d'action optimal.
                  </div>
                </div>
              </div>
              <button className="sf-btn sf-btn-primary" onClick={fetchSuggestions} disabled={aiLoading}>
                {aiLoading ? "⏳ Analyse en cours..." : "✨ Générer les suggestions"}
              </button>
            </div>

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>
                <div style={{ marginBottom: 8 }}>Analyse de vos {pending.length} tâches en cours…</div>
                <div className="sf-progress-bg" style={{ maxWidth: 200, margin: "0 auto" }}>
                  <div className="sf-progress-fill" style={{ width: "60%", animation: "none" }} />
                </div>
              </div>
            )}

            {aiResult && (
              <>
                <div className="sf-card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", padding: "12px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>📋 {aiResult.resume}</div>
                </div>

                {aiResult.ordre?.length > 0 && (
                  <div className="sf-card" style={{ padding: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Ordre recommandé pour aujourd'hui</div>
                    {aiResult.ordre.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{item.tache}</div>
                          <div className="sf-conseil">{item.conseil}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {aiResult.astuces?.length > 0 && (
                  <div className="sf-card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>💡 Astuces personnalisées</div>
                    {aiResult.astuces.map((a, i) => (
                      <div key={i} className="sf-astuce">
                        <span style={{ flexShrink: 0, fontSize: 14 }}>{["⚡", "📚", "🎯"][i] || "💡"}</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                )}

                {aiResult.pomodoro && (
                  <div className="sf-card" style={{ padding: 16, marginTop: 12, background: "#fffbeb", borderColor: "#fde68a" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>🍅 Suggestion Pomodoro</div>
                    <div style={{ fontSize: 12, color: "#78350f" }}>{aiResult.pomodoro.sessions} sessions recommandées pour couvrir les tâches prioritaires.</div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="sf-modal-bg" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="sf-modal">
            <h3>{editTask ? "✏️ Modifier la tâche" : "➕ Nouvelle tâche"}</h3>
            <label className="sf-label">Titre *</label>
            <input className="sf-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ex : Rapport de projet BD" />
            <label className="sf-label">Matière</label>
            <input className="sf-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="ex : Bases de données" />
            <div className="sf-grid2">
              <div>
                <label className="sf-label">Catégorie</label>
                <select className="sf-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="sf-label">Échéance *</label>
                <input type="date" className="sf-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div className="sf-grid2">
              <div>
                <label className="sf-label">Priorité</label>
                <select className="sf-input" value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })}>
                  <option value={1}>Faible</option>
                  <option value={2}>Moyenne</option>
                  <option value={3}>Haute</option>
                </select>
              </div>
              <div>
                <label className="sf-label">Durée estimée (h)</label>
                <input type="number" className="sf-input" value={form.estimatedHours} min={0.5} step={0.5} onChange={e => setForm({ ...form, estimatedHours: +e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="sf-btn sf-btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="sf-btn sf-btn-primary" onClick={save} disabled={!form.title || !form.deadline}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
