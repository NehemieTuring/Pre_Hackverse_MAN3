"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = "Confirmer", isDestructive = false,
  loading = false
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(2, 6, 23, 0.7)",
          backdropFilter: "blur(8px)",
        }} 
      />
      
      {/* Modal */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "420px",
        background: "var(--sidebar)",
        border: "1px solid var(--card-border)",
        borderRadius: "28px",
        padding: "32px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
        animation: "modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{
          width: "56px", height: "56px",
          borderRadius: "16px",
          background: isDestructive ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "24px",
        }}>
          <AlertTriangle size={28} color={isDestructive ? "#f87171" : "#60a5fa"} />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--foreground)", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        
        <p style={{ fontSize: "15px", color: "var(--muted)", margin: "0 0 32px", lineHeight: "1.6" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: "14px", borderRadius: "14px",
              border: "1px solid var(--card-border)",
              background: "var(--card)",
              color: "var(--foreground)", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "all 0.2s",
            }}>
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 2, padding: "14px", borderRadius: "14px",
              border: "none",
              background: isDestructive ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", fontWeight: 800, fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: isDestructive ? "0 8px 24px rgba(239, 68, 68, 0.25)" : "0 8px 24px rgba(59, 130, 246, 0.25)",
            }}>
            {loading ? <Loader2 size={16} className="spin" /> : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
