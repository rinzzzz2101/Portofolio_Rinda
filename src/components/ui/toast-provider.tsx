"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />,
  error:   <XCircle      className="w-5 h-5 text-red-400   shrink-0" />,
  warning: <AlertCircle  className="w-5 h-5 text-yellow-400 shrink-0" />,
  info:    <Info         className="w-5 h-5 text-blue-400  shrink-0" />,
};

const borders: Record<ToastType, string> = {
  success: "border-green-500/40 bg-green-500/10",
  error:   "border-red-500/40   bg-red-500/10",
  warning: "border-yellow-500/40 bg-yellow-500/10",
  info:    "border-blue-500/40  bg-blue-500/10",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, visible: true }]);

    // Start hide animation after 3s
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, visible: false } : t));
    }, 3000);

    // Remove from DOM after animation completes (300ms extra)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Container — fixed bottom-right */}
      <div
        style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "12px", pointerEvents: "none" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "all",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              width: "340px",
              maxWidth: "90vw",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.97)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
            className={borders[t.type]}
          >
            <div style={{ marginTop: "1px" }}>{icons[t.type]}</div>
            <p style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "white", lineHeight: 1.5 }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              style={{ color: "#9ca3af", cursor: "pointer", background: "none", border: "none", padding: 0, marginTop: "1px", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
