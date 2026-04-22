"use client";

import { Search, Home, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
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
        width: "80px", height: "80px",
        borderRadius: "24px",
        background: "rgba(148, 163, 184, 0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "32px"
      }}>
        <Search size={40} color="#94a3b8" />
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "12px", letterSpacing: "-0.02em" }}>
        Page introuvable
      </h1>
      <p style={{ color: "rgba(148, 163, 184, 0.7)", maxWidth: "420px", marginBottom: "40px", fontSize: "16px", lineHeight: "1.6" }}>
        Désolé, il semble que la page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        <Link 
          href="/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "14px 28px", borderRadius: "14px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff", fontWeight: 800, fontSize: "15px",
            textDecoration: "none", boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
            transition: "transform 0.2s"
          }}
        >
          <Home size={18} /> Accueil
        </Link>
      </div>
    </div>
  );
}
