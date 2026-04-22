"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#fff"
    }}>
      {/* Background Image */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/welcome_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0
      }} />

      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.75) 60%, rgba(15,23,42,0.97) 100%)",
        zIndex: 1
      }} />

      {/* Header Nav */}
      <header style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "28px 48px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
            color: "#fff",
            fontStyle: "italic",
            boxShadow: "0 4px 24px rgba(59,130,246,0.4)"
          }}>T</div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", color: "#fff" }}>
            time-MAN3
          </span>
        </div>
      </header>

      {/* Hero content */}
      <main style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "0 24px",
        maxWidth: 860,
        width: "100%"
      }}>
        {/* Main title */}
        <h1 style={{
          fontSize: "clamp(44px, 8vw, 82px)",
          fontWeight: 900,
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          marginBottom: 52,
          textShadow: "0 4px 32px rgba(0,0,0,0.5)"
        }}>
          Gérer efficacement<br />
          votre temps avec{" "}
          <span style={{
            background: "linear-gradient(135deg, #60a5fa, #818cf8, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>time-MAN3</span>
        </h1>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
        }}>
          <Link href="/login" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 56px",
            borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            textDecoration: "none",
            boxShadow: "0 8px 40px rgba(59,130,246,0.45)",
            letterSpacing: "-0.01em",
          }}>
            Se Connecter
          </Link>
          <Link href="/register" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 56px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.07)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            textDecoration: "none",
            backdropFilter: "blur(12px)",
            letterSpacing: "-0.01em",
          }}>
            S'Inscrire
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 10,
        color: "rgba(100,116,139,0.7)",
        fontSize: 13,
        fontWeight: 500
      }}>
        © 2026 time-MAN3
      </footer>
    </div>
  );
}
