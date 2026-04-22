"use client";

import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Bell, Shield, Save, Pencil, X, CheckCircle, Lock, Trash2 } from "lucide-react";

const card = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: 20,
} as const;

const inputBase = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1px solid var(--card-border)",
  background: "var(--card)",
  color: "var(--foreground)",
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
  color: "var(--muted)",
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

  // Password Modal
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [f1, setF1] = useState(false);
  const [f2, setF2] = useState(false);
  const [f3, setF3] = useState(false);

  const handlePassChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return toast.error("Les mots de passe ne correspondent pas.");
    if (passData.new.length < 6) return toast.error("Le nouveau mot de passe doit faire au moins 6 caractères.");
    
    try {
      setPassLoading(true);
      await api.post("/users/me/change-password", {
        currentPassword: passData.current,
        newPassword: passData.new
      });
      toast.success("Mot de passe mis à jour !");
      setShowPassModal(false);
      setPassData({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors du changement de mot de passe.");
    } finally {
      setPassLoading(false);
    }
  };

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
    <>
      <div style={{
      padding: "32px",
      maxWidth: 900,
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "var(--foreground)",
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
              background: "#10b981", border: "3px solid var(--background)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle size={12} color="#fff" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
                {user?.fullName}
              </h1>
              <span style={{
                padding: "3px 10px", borderRadius: 8,
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#60a5fa", fontSize: 11, fontWeight: 700,
              }}>Pro Student</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 14 }}>
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
              <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "var(--foreground)" }}>Notifications</h3>
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
              <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "var(--foreground)" }}>Sécurité</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button 
                onClick={() => setShowPassModal(true)}
                style={{
                  padding: "13px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "var(--foreground)", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "inherit", transition: "all 0.2s",
                }}>
                <Lock size={16} color="var(--accent)" /> Changer le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Password Modal */}
    {showPassModal && (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}>
        <div style={{
          ...card, width: "100%", maxWidth: 440, padding: 32,
          background: "var(--sidebar)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          animation: "modalFadeUp 0.3s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={20} color="#60a5fa" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "-0.02em", color: "var(--foreground)" }}>Changer le mot de passe</h2>
          </div>

          <form onSubmit={handlePassChange} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>Mot de passe actuel</label>
              <input 
                type="password" required
                value={passData.current}
                onChange={e => setPassData({...passData, current: e.target.value})}
                onFocus={() => setF1(true)} onBlur={() => setF1(false)}
                style={{ ...inputBase, border: f1 ? "1px solid #3b82f6" : inputBase.border }}
              />
            </div>
            <div style={{ width: "100%", height: 1, background: "var(--card-border)" }} />
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input 
                type="password" required
                value={passData.new}
                onChange={e => setPassData({...passData, new: e.target.value})}
                onFocus={() => setF2(true)} onBlur={() => setF2(false)}
                style={{ ...inputBase, border: f2 ? "1px solid #3b82f6" : inputBase.border }}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
              <input 
                type="password" required
                value={passData.confirm}
                onChange={e => setPassData({...passData, confirm: e.target.value})}
                onFocus={() => setF3(true)} onBlur={() => setF3(false)}
                style={{ ...inputBase, border: f3 ? "1px solid #3b82f6" : inputBase.border }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button 
                type="button"
                onClick={() => setShowPassModal(false)}
                style={{
                  flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "#94a3b8", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Annuler</button>
              <button 
                type="submit"
                disabled={passLoading}
                style={{
                  flex: 1.5, padding: "14px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  cursor: passLoading ? "not-allowed" : "pointer",
                  opacity: passLoading ? 0.7 : 1, fontFamily: "inherit",
                }}>
                {passLoading ? "Chargement..." : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
        <style>{`
          @keyframes modalFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )}
  </> );
}
