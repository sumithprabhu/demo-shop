"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Toasts render in one body-level live region, outside <main>, the way most apps do it with a
// portal. Intenzo reads exactly that kind of region (ARCHITECTURE §21.3).

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface Toast {
  id: number;
  text: string;
  /** status: news ("Added …"); alert: an error the shopper must see. */
  kind: "status" | "alert";
  action?: ToastAction;
}

export const TOAST_MS = 5000;

const ToastContext = createContext<((toast: Omit<Toast, "id">) => void) | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback(
    (id: number) => setToasts((current) => current.filter((t) => t.id !== id)),
    [],
  );
  const show = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = nextId++;
      setToasts((current) => [...current, { ...toast, id }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );
  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <span role={t.kind}>{t.text}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onAction();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (toast: Omit<Toast, "id">) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast needs a <ToastProvider> above it");
  return show;
}
