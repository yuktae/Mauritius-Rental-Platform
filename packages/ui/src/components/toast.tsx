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
  title: string;
  description?: string;
};

type ShowToastInput = string | { title: string; description?: string; tone?: ToastTone };

type ToastContextValue = {
  toasts: Toast[];
  showToast: (input: ShowToastInput, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({
  children,
  duration = 4500
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ShowToastInput, tone: ToastTone = "success") => {
    nextId += 1;
    const next: Toast =
      typeof input === "string"
        ? { id: nextId, tone, title: input }
        : {
            id: nextId,
            tone: input.tone ?? tone,
            title: input.title,
            description: input.description
          };
    // Newest on top, and never let the stack grow past three: a phone screen
    // cannot show more, and older ones are already stale by then.
    setToasts((current) => [next, ...current].slice(0, 3));
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

const tones: Record<
  ToastTone,
  { badge: string; bar: string; icon: ReactNode }
> = {
  success: {
    badge: "bg-success",
    bar: "bg-success",
    icon: (
      <path
        d="M5 10.5 8.5 14 15 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  },
  danger: {
    badge: "bg-danger",
    bar: "bg-danger",
    icon: (
      <path
        d="M6.5 6.5 13.5 13.5M13.5 6.5 6.5 13.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    )
  },
  info: {
    badge: "bg-trust",
    bar: "bg-trust",
    icon: (
      <path
        d="M10 9v5M10 6.2v.1"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    )
  }
};

export function ToastViewport({
  toasts,
  onDismiss,
  duration = 4500
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  duration?: number;
}) {
  return (
    <div
      // Bottom on a phone, clear of the home indicator. Top-right from tablet
      // up, where the thumb is not the input device.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:items-end"
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
  const [paused, setPaused] = useState(false);
  const tone = tones[toast.tone];

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, duration, onDismiss, paused]);

  return (
    <div
      role={toast.tone === "danger" ? "alert" : undefined}
      // Hovering or focusing inside stops the clock, so a toast cannot vanish
      // while it is being read or its action reached for.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-card border border-line bg-surface-raised shadow-lifted motion-safe:animate-rise"
    >
      <div className="flex items-start gap-3 p-4 pr-2">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white",
            tone.badge
          )}
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4">
            {tone.icon}
          </svg>
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
          <p className="text-sm font-semibold leading-snug">{toast.title}</p>
          {toast.description ? (
            <p className="text-sm leading-snug text-ink-muted">{toast.description}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
          className="-mr-1 flex size-12 shrink-0 items-center justify-center rounded-control text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4">
            <path
              d="M6 6l8 8M14 6l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Time remaining. Freezes with the timer on hover. */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-line/60">
        <span
          className={cn("block h-full origin-left", tone.bar)}
          style={{
            animation: `toast-countdown ${duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running"
          }}
        />
      </span>

      <style>{`@keyframes toast-countdown { from { transform: scaleX(1) } to { transform: scaleX(0) } }`}</style>
    </div>
  );
}
