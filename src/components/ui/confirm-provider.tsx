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
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors.icon}`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {state.title}
                </h3>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {state.message}
              </p>
            </div>

            {/* Footer Actions */}
            <div
              className="p-4 px-6 flex justify-end gap-3 border-t"
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderColor: 'var(--border-default)'
              }}
            >
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {state.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-opacity shadow-sm ${colors.button}`}
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
