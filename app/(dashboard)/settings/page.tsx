"use client";

import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Bell, Shield, Save, Pencil, X, CheckCircle, Lock, Trash2 } from "lucide-react";

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
} as const;

const inputBase = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f1f5f9",
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "rgba(148,163,184,0.7)",
  marginBottom: 8,
};

export default function SettingsPage() {
  const [user, setUser] = useState(getUser());
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fEmail, setFEmail] = useState(false);
  const [fName, setFName] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await api.put("/users/me", formData);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifToggle = async () => {
    try {
      const newVal = !notifEnabled;
      setNotifEnabled(newVal);
      await api.patch("/users/me/notifications", { enabled: newVal });
      toast.success(newVal ? "Notifications activées" : "Notifications désactivées");
    } catch {
      setNotifEnabled(v => !v);
      toast.error("Erreur de mise à jour des notifications");
    }
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={{
      padding: "32px",
      maxWidth: 900,
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "#f1f5f9",
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>
      {/* Profile Header */}
      <div style={{
        ...card,
        padding: "32px",
        background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.08))",
        border: "1px solid rgba(59,130,246,0.2)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -50, right: -50,
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
          borderRadius: "50%",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 900, color: "#fff",
              boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
            }}>{initial}</div>
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 22, height: 22, borderRadius: "50%",
              background: "#10b981", border: "3px solid #0f172a",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle size={12} color="#fff" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "#f8fafc", letterSpacing: "-0.03em" }}>
                {user?.fullName}
              </h1>
              <span style={{
                padding: "3px 10px", borderRadius: 8,
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#60a5fa", fontSize: 11, fontWeight: 700,
              }}>Pro Student</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(148,163,184,0.8)", fontSize: 14 }}>
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => { setEditing(!editing); if (editing) setFormData({ fullName: user?.fullName || "", email: user?.email || "" }); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 20px", borderRadius: 12,
              background: editing ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
              border: editing ? "1px solid rgba(255,255,255,0.12)" : "none",
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {editing ? <><X size={16} /> Annuler</> : <><Pencil size={16} /> Modifier</>}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Account Info */}
        <div style={{ ...card, padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} color="#60a5fa" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0 }}>Informations du compte</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input
                disabled={!editing}
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                onFocus={() => setFName(true)}
                onBlur={() => setFName(false)}
                style={{ ...inputBase, border: fName ? "1px solid #3b82f6" : inputBase.border, opacity: editing ? 1 : 0.6 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Adresse email</label>
              <input
                disabled={!editing}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFEmail(true)}
                onBlur={() => setFEmail(false)}
                style={{ ...inputBase, border: fEmail ? "1px solid #3b82f6" : inputBase.border, opacity: editing ? 1 : 0.6 }}
              />
            </div>
            {editing && (
              <button
                onClick={handleUpdate}
                disabled={loading}
                style={{
                  padding: "14px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: loading ? 0.7 : 1, fontFamily: "inherit",
                }}
              >
                <Save size={16} />
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Notifications */}
          <div style={{ ...card, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={18} color="#f59e0b" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0 }}>Notifications</h3>
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>Rappels par email</p>
                <p style={{ fontSize: 11, color: "rgba(148,163,184,0.65)", margin: 0, fontWeight: 500 }}>
                  Alertes pour les tâches urgentes
                </p>
              </div>
              <button
                onClick={handleNotifToggle}
                style={{
                  width: 48, height: 26, borderRadius: 999, border: "none",
                  background: notifEnabled ? "#3b82f6" : "rgba(255,255,255,0.1)",
                  cursor: "pointer", position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3,
                  left: notifEnabled ? "calc(100% - 22px)" : 3,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }} />
              </button>
            </div>
          </div>

          {/* Security */}
          <div style={{ ...card, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={18} color="#10b981" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0 }}>Sécurité</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{
                padding: "13px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "#f1f5f9", fontWeight: 700, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                fontFamily: "inherit",
              }}>
                <Lock size={16} color="#94a3b8" /> Changer le mot de passe
              </button>
              <button style={{
                padding: "13px 16px", borderRadius: 12,
                background: "rgba(248,113,113,0.05)",
                border: "1px solid rgba(248,113,113,0.15)",
                color: "#f87171", fontWeight: 700, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                fontFamily: "inherit",
              }}>
                <Trash2 size={16} /> Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
