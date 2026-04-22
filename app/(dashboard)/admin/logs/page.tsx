"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Shield, Bell, Calendar, Mail, CheckCircle2, 
  XCircle, Filter, RotateCcw, ChevronLeft, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface LogEntry {
  id: number;
  taskTitle: string;
  userEmail: string;
  sentAt: string;
  success: boolean;
  errorMessage?: string;
  type: string;
}

interface PageResponse {
  content: LogEntry[];
  totalPages: number;
  number: number;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchLogs = async (p: number) => {
    try {
      setLoading(true);
      const res = await api.get<PageResponse>(`/admin/notifications/logs?page=${p}&size=10&sort=sentAt,desc`);
      setLogs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Accès refusé. Droits administrateur requis.");
    } finally {
      setLoading(false);
    }
  };

  const triggerReminders = async () => {
    try {
      setTriggering(true);
      await api.post("/admin/notifications/trigger");
      toast.success("Rappels déclenchés avec succès !");
      fetchLogs(0);
    } catch {
      toast.error("Erreur lors du déclenchement.");
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => { fetchLogs(page); }, [page]);

  const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 24,
  };

  return (
    <div style={{ padding: "40px", maxWidth: 1200, margin: "0 auto", color: "#f1f5f9", fontFamily: "inherit" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Console Administrateur</h1>
          </div>
          <p style={{ color: "rgba(148,163,184,0.6)", margin: 0, fontWeight: 500 }}>Historique des notifications & Rappels automatiques</p>
        </div>

        <button 
          onClick={triggerReminders}
          disabled={triggering}
          style={{
            padding: "14px 24px", borderRadius: 14,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
          }}>
          <RotateCcw size={18} className={triggering ? "spin" : ""} />
          Forcer les rappels (24h)
        </button>
      </div>

      {/* Logs Table */}
      <div style={{ ...cardStyle }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Logs de Notification</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(148,163,184,0.5)", fontSize: 13 }}>
            <Filter size={14} /> <span>Trié par date décroissante</span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left", color: "rgba(148,163,184,0.4)" }}>
                <th style={{ padding: "16px 24px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Utilisateur</th>
                <th style={{ padding: "16px 24px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Tâche</th>
                <th style={{ padding: "16px 24px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Date d&apos;envoi</th>
                <th style={{ padding: "16px 24px", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>Chargement des logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>Aucun log trouvé.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Mail size={14} color="#94a3b8" />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{log.userEmail}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{log.taskTitle}</td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "rgba(148,163,184,0.6)" }}>
                    {format(new Date(log.sentAt), "dd MMM yyyy HH:mm", { locale: fr })}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {log.success ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 12, fontWeight: 700 }}>
                        <CheckCircle2 size={14} /> Envoyé
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444", fontSize: 12, fontWeight: 700 }}>
                        <XCircle size={14} /> Échec
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
            Page {page + 1} sur {totalPages}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", opacity: page === 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={16} color="#fff" />
            </button>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", opacity: page >= totalPages - 1 ? 0.3 : 1 }}
            >
              <ChevronRight size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
