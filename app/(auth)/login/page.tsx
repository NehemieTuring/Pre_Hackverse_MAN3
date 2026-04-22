"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/auth";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      saveAuth(res.data.token, res.data.user);
      toast.success("Connexion réussie !");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Identifiants incorrects. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#0f172a",
      overflow: "hidden",
    }}>
      {/* Left Panel — Background Image */}
      <div style={{
        flex: 1,
        display: "none",
        position: "relative",
        overflow: "hidden",
        // show on large screens via JS trick below
      }} className="left-panel">
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/welcome_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(59,130,246,0.3) 100%)",
        }} />
        <div style={{
          position: "relative",
          zIndex: 2,
          padding: "48px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 20,
              color: "#fff",
              fontStyle: "italic",
              boxShadow: "0 4px 24px rgba(59,130,246,0.5)",
            }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-0.03em" }}>time-MAN3</span>
          </div>
          {/* Bottom quote */}
          <div style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: 32,
          }}>
            <p style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 600, lineHeight: 1.6, marginBottom: 16 }}>
              "La gestion du temps n'est pas une compétence, c'est une discipline."
            </p>
            <p style={{ color: "rgba(148,163,184,0.9)", fontSize: 14, fontWeight: 600 }}>— time-MAN3 Protocol</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
        position: "relative",
        zIndex: 10,
      }}>
        {/* Glow orbs */}
        <div style={{
          position: "absolute",
          top: "-20%",
          right: "-20%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-20%",
          left: "-20%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        <div style={{ width: "100%", position: "relative", zIndex: 2 }}>
          {/* Header */}
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            {/* Logo mark */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 40px rgba(59,130,246,0.4)",
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              fontStyle: "italic",
            }}>T</div>
            <h1 style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#f8fafc",
              letterSpacing: "-0.04em",
              marginBottom: 10,
            }}>Bon retour ! 👋</h1>
            <p style={{ color: "rgba(148,163,184,0.9)", fontSize: 16, fontWeight: 500 }}>
              Connectez-vous à <strong style={{ color: "#60a5fa" }}>time-MAN3</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.9)",
                marginBottom: 8,
              }}>Adresse Email</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  pointerEvents: "none",
                  opacity: 0.5,
                }}>✉</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="vous@email.com"
                  style={{
                    width: "100%",
                    padding: "16px 16px 16px 48px",
                    borderRadius: 16,
                    border: emailFocus ? "2px solid #3b82f6" : "2px solid rgba(255,255,255,0.08)",
                    background: emailFocus ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.04)",
                    color: "#f1f5f9",
                    fontSize: 15,
                    fontWeight: 500,
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.9)",
                marginBottom: 8,
              }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  pointerEvents: "none",
                  opacity: 0.5,
                }}>🔒</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  placeholder="••••••••••"
                  style={{
                    width: "100%",
                    padding: "16px 16px 16px 48px",
                    borderRadius: 16,
                    border: passFocus ? "2px solid #3b82f6" : "2px solid rgba(255,255,255,0.08)",
                    background: passFocus ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.04)",
                    color: "#f1f5f9",
                    fontSize: 15,
                    fontWeight: 500,
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "18px",
                borderRadius: 16,
                border: "none",
                background: loading
                  ? "rgba(59,130,246,0.5)"
                  : "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
                transition: "all 0.2s",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 18,
                    height: 18,
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Connexion en cours...
                </>
              ) : "🚀 Se Connecter"}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "28px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "rgba(100,116,139,0.8)", fontSize: 12, fontWeight: 600 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Register link */}
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "rgba(100,116,139,0.9)", fontSize: 15, fontWeight: 500 }}>
              Pas encore de compte ?{" "}
            </span>
            <Link href="/register" style={{
              color: "#60a5fa",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}>
              S'inscrire gratuitement →
            </Link>
          </div>

          {/* Back to home */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/" style={{
              color: "rgba(100,116,139,0.7)",
              fontWeight: 500,
              fontSize: 13,
              textDecoration: "none",
            }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .left-panel { display: flex !important; flex: 1; }
        }
      `}</style>
    </div>
  );
}
