"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { cn } from "../cn";

export type ToastTone = "success" | "danger" | "info";

export type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({
  children,
  duration = 4000
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    nextId += 1;
    setToasts((current) => [...current, { id: nextId, tone, message }]);
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} duration={duration} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}

const toneClass: Record<ToastTone, string> = {
  success: "border-success/30 bg-success-soft",
  danger: "border-danger/30 bg-danger-soft",
  info: "border-line bg-surface-raised"
};

export function ToastViewport({
  toasts,
  onDismiss,
  duration = 4000
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  duration?: number;
}) {
  return (
    <div
      // Bottom on a phone so it does not collide with the status bar, and it
      // clears the home indicator.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} duration={duration} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
  duration
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
  duration: number;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card border px-4 py-3 shadow-card",
        toneClass[toast.tone]
      )}
    >
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="min-h-12 shrink-0 rounded-control px-3 text-label font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        Close
      </button>
    </div>
  );
}
