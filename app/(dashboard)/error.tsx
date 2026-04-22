"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div style={{
      height: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      textAlign: "center",
      color: "#f1f5f9",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: "64px", height: "64px",
        borderRadius: "20px",
        background: "rgba(239, 68, 68, 0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "24px"
      }}>
        <AlertCircle size={32} color="#f87171" />
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px", letterSpacing: "-0.02em" }}>
        Oups ! Quelque chose a mal tourné.
      </h1>
      <p style={{ color: "rgba(148, 163, 184, 0.7)", maxWidth: "400px", marginBottom: "32px", fontSize: "15px", lineHeight: "1.6" }}>
        Une erreur inattendue s'est produite lors du chargement de cette page. Pas de panique, vos données sont en sécurité.
      </p>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => reset()}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", fontWeight: 700, fontSize: "14px",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          <RotateCcw size={16} /> Réessayer
        </button>
        <Link 
          href="/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff", fontWeight: 700, fontSize: "14px",
            textDecoration: "none", boxShadow: "0 8px 24px rgba(59,130,246,0.3)"
          }}
        >
          <Home size={16} /> Retour au Dashboard
        </Link>
      </div>
    </div>
  );
}
