import type { ReactNode } from "react";

import { cn } from "../cn";

export type BannerTone = "info" | "success" | "warning" | "danger" | "offline";

export type BannerProps = {
  tone?: BannerTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const tones: Record<BannerTone, string> = {
  info: "border-line bg-surface-raised text-ink",
  success: "border-success/30 bg-success-soft text-ink",
  warning: "border-warning/40 bg-warning-soft text-ink",
  danger: "border-danger/30 bg-danger-soft text-ink",
  offline: "border-line-strong bg-surface-sunken text-ink"
};

const dots: Record<BannerTone, string> = {
  info: "bg-trust",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  offline: "bg-ink-subtle"
};

/**
 * A persistent condition, not a passing event. Offline is a banner; a saved
 * confirmation is a toast.
 */
export function Banner({ tone = "info", title, children, action, className }: BannerProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-card border px-4 py-3.5",
        tones[tone],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("mt-1.5 size-2 shrink-0 rounded-full", dots[tone])}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-sm text-ink-muted">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
