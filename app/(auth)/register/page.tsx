"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme") as any;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      toast.success("Compte créé avec succès !");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: "100%",
    padding: "16px 16px 16px 48px",
    borderRadius: 16,
    border: focused === field ? "2px solid var(--accent)" : "2px solid var(--card-border)",
    background: "var(--card)",
    color: "var(--foreground)",
    fontSize: 15,
    fontWeight: 500,
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  });

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--muted)",
    marginBottom: 8,
  };

  const fields = [
    { key: "fullName", label: "Nom complet", icon: "👤", type: "text", placeholder: "Jean Dupont" },
    { key: "email", label: "Adresse Email", icon: "✉", type: "email", placeholder: "vous@email.com" },
    { key: "password", label: "Mot de passe", icon: "🔒", type: "password", placeholder: "••••••••••" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "var(--background)",
      color: "var(--foreground)",
      overflow: "hidden",
    }}>
      {/* Theme Toggle Overlay */}
      <button 
        onClick={toggleTheme}
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 100,
          width: 44, height: 44, borderRadius: 12,
          background: "var(--card)", border: "1px solid var(--card-border)",
          color: "var(--foreground)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.2s",
        }}>
        {theme === 'dark' ? "☀️" : "🌙"}
      </button>

      {/* Left Panel */}
      <div className="left-panel" style={{
        flex: 1,
        display: "none",
        position: "relative",
        overflow: "hidden",
      }}>
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
          background: "linear-gradient(135deg, var(--sidebar) 0%, rgba(99,102,241,0.3) 100%)",
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 20, color: "#fff", fontStyle: "italic",
              boxShadow: "0 4px 24px rgba(59,130,246,0.5)",
            }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-0.03em" }}>time-MAN3</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
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
          position: "absolute", top: "-15%", right: "-15%",
          width: "60%", height: "60%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{ width: "100%", position: "relative", zIndex: 2 }}>
          {/* Header */}
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 40px rgba(99,102,241,0.4)",
              fontSize: 28, fontWeight: 900, color: "#fff",
            }}>✦</div>
            <h1 style={{
              fontSize: 34, fontWeight: 900, color: "var(--foreground)",
              letterSpacing: "-0.04em", marginBottom: 10,
            }}>Rejoignez time-MAN3 🚀</h1>
            <p style={{ color: "var(--muted)", fontSize: 15, fontWeight: 500 }}>
              Créez votre compte et prenez le contrôle de votre temps.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {fields.map(({ key, label, icon, type, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 16, top: "50%",
                    transform: "translateY(-50%)", fontSize: 16,
                    pointerEvents: "none", opacity: 0.5,
                  }}>{icon}</span>
                  <input
                    type={key === "password" && showPassword ? "text" : type}
                    required
                    placeholder={placeholder}
                    value={(formData as any)[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputStyle(key),
                      paddingRight: key === "password" ? 48 : 16,
                    }}
                  />
                  {key === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

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
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
                transition: "all 0.2s",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: "inline-block", width: 18, height: 18,
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Création en cours...
                </>
              ) : "✦ Créer mon compte"}
            </button>
          </form>

          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "28px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--card-border)" }} />
            <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "var(--card-border)" }} />
          </div>

          <div style={{ textAlign: "center" }}>
            <span style={{ color: "var(--muted)", fontSize: 15, fontWeight: 500 }}>
              Déjà un compte ?{" "}
            </span>
            <Link href="/login" style={{
              color: "var(--accent)", fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}>
              Se connecter →
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/" style={{
              color: "rgba(100,116,139,0.7)", fontWeight: 500, fontSize: 13, textDecoration: "none",
            }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .left-panel { display: flex !important; flex: 1; }
        }
      `}</style>
    </div>
  );
}
