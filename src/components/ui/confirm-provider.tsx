"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "warning" | "info";
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    return new Promise<boolean>((resolve) => {
      if (typeof options === "string") {
        setState({
          isOpen: true,
          title: "Konfirmasi Tindakan",
          message: options,
          confirmText: "Ya, Hapus",
          cancelText: "Batal",
          variant: "danger",
          resolve,
        });
      } else {
        setState({
          isOpen: true,
          title: options.title || "Konfirmasi Tindakan",
          message: options.message,
          confirmText: options.confirmText || "Ya, Lanjutkan",
          cancelText: options.cancelText || "Batal",
          variant: options.variant || "danger",
          resolve,
        });
      }
    });
  }, []);

  const handleCancel = () => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  };

  const handleConfirm = () => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  };

  const variantColors = {
    danger: {
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      button: "bg-red-600 hover:bg-red-700 text-white",
      icon: "text-red-500 bg-red-500/10",
    },
    warning: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/10",
      button: "bg-yellow-600 hover:bg-yellow-700 text-black",
      icon: "text-yellow-500 bg-yellow-500/10",
    },
    info: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "text-blue-500 bg-blue-500/10",
    },
  };

  const colors = state ? variantColors[state.variant] : variantColors.danger;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Modal Dialog overlay */}
      {state && state.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#09090b",
              borderRadius: "16px",
              border: "1px solid #27272a",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Body */}
            <div style={{ padding: "24px 24px 20px 24px" }} className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors.icon}`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "white" }}>
                  {state.title}
                </h3>
              </div>

              <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.6 }}>
                {state.message}
              </p>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                backgroundColor: "#121214",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                borderTop: "1px solid #1f1f23",
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #27272a",
                  backgroundColor: "transparent",
                  color: "#e4e4e7",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#18181b")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {state.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`${colors.button}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
