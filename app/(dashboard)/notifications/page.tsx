"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bell, Mail, Clock, Trash2, CheckCircle2, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const cardStyle = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: 16,
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: 16,
  transition: "all 0.2s",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.content || []);
    } catch (err) {
      toast.error("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div style={{
      padding: "32px",
      maxWidth: 800,
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "var(--foreground)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(59,130,246,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bell size={22} color="#3b82f6" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>Notifications</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Historique de vos alertes et rappels mail</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 className="spin" size={32} color="#3b82f6" />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 40px",
          background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid var(--card-border)",
        }}>
          <AlertCircle size={48} color="var(--muted)" style={{ opacity: 0.2, margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 600, color: "var(--muted)" }}>Aucune notification pour le moment</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((notif) => (
            <div key={notif.id} style={cardStyle} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={e => e.currentTarget.style.background = "var(--card)"}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: notif.status === "SENT" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {notif.status === "SENT" ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>
                  Rappel : {notif.task?.title || "Tâche"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} /> {new Date(notif.sentAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Mail size={12} /> Email envoyé
                  </span>
                </div>
              </div>

              <button 
                onClick={() => deleteNotif(notif.id)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: "transparent", color: "var(--muted)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
