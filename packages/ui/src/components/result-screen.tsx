import type { ReactNode } from "react";

import { cn } from "../cn";

export type ResultStatus = "success" | "error" | "pending";

export type ResultScreenProps = {
  status: ResultStatus;
  title: string;
  description?: ReactNode;
  /** Main way forward. On a phone this sits full width at the bottom. */
  primaryAction?: ReactNode;
  /** The escape hatch: try again, go back, contact support. */
  secondaryAction?: ReactNode;
  /** Reference, order or booking number. Shown in mono so it can be read aloud. */
  reference?: string;
  className?: string;
};

const marks: Record<
  ResultStatus,
  { ring: string; badge: string; glow: string; path: string; length: number }
> = {
  success: {
    ring: "text-success",
    badge: "bg-success",
    glow: "bg-success/15",
    // tick
    path: "M15 25.5 L21.5 32 L33 20",
    length: 34
  },
  error: {
    ring: "text-danger",
    badge: "bg-danger",
    glow: "bg-danger/15",
    // cross
    path: "M17 17 L31 31 M31 17 L17 31",
    length: 40
  },
  pending: {
    ring: "text-warning",
    badge: "bg-warning",
    glow: "bg-warning/15",
    // clock hands
    path: "M24 15 L24 24 L30 28",
    length: 24
  }
};

/**
 * The end of a flow: signed in, payment taken, handover confirmed, or any of
 * those failed.
 *
 * Deliberately never a dead end. A result always offers at least one way
 * forward, because a screen that only says "Failed" leaves the user stuck with
 * the back button as their only option.
 */
export function ResultScreen({
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
  reference,
  className
}: ResultScreenProps) {
  const mark = marks[status];

  return (
    <div
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10",
        className
      )}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-panel bg-surface-raised px-6 py-10 text-center shadow-card sm:px-8">
        <span className="relative flex size-24 items-center justify-center">
          {/* soft halo, purely decorative */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 rounded-full motion-safe:animate-pop",
              mark.glow
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "relative flex size-[4.5rem] items-center justify-center rounded-full motion-safe:animate-pop",
              mark.badge
            )}
          >
            <svg viewBox="0 0 48 48" className="size-full" fill="none">
              <path
                d={mark.path}
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={mark.length}
                strokeDashoffset={0}
                style={{ ["--draw-length" as string]: mark.length }}
                className="motion-safe:animate-draw"
              />
            </svg>
          </span>
        </span>

        <div className="flex flex-col gap-2 motion-safe:animate-fade-up">
          <h1 className="text-title font-bold text-balance">{title}</h1>
          {description ? (
            <p className="text-pretty text-ink-muted">{description}</p>
          ) : null}
          {reference ? (
            <p className="pt-1 font-mono text-label tabular-nums text-ink-subtle">
              {reference}
            </p>
          ) : null}
        </div>

        {primaryAction || secondaryAction ? (
          <div className="flex w-full flex-col gap-2 pt-1 motion-safe:animate-fade-up">
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}
