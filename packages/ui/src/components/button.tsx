import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  /** Shows a spinner, blocks input, and announces busy. */
  loading?: boolean;
  /** Shown while loading. Keep the verb: "Sign in" becomes "Signing in". */
  loadingLabel?: string;
  fullWidth?: boolean;
  children?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-press",
  secondary: "border border-line-strong bg-surface-raised text-ink hover:bg-surface-sunken",
  ghost: "text-ink hover:bg-surface-sunken",
  danger: "bg-danger text-white hover:brightness-95 active:brightness-90"
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  fullWidth = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  // A loading button is not interactive, but it must not look greyed out
  // either: it is working, not unavailable.
  const isBlocked = disabled || loading;
  const looksDisabled = disabled && !loading;

  return (
    <button
      {...props}
      type={type}
      disabled={isBlocked}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold transition-colors",
        // 48px floor: thumb accuracy collapses below it
        size === "md" ? "min-h-12 px-6 text-base" : "min-h-14 px-7 text-lg",
        fullWidth && "w-full",
        variants[variant],
        looksDisabled &&
          "cursor-not-allowed border-transparent bg-surface-sunken text-ink-subtle hover:bg-surface-sunken",
        loading && "cursor-progress",
        className
      )}
    >
      {loading ? <Spinner /> : null}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
}
