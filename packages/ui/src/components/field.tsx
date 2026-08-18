import type { ReactNode } from "react";

import { cn } from "../cn";

export type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Label, control, and one line of hint or error.
 *
 * The message row reserves its height whether or not a message is present, so
 * an error appearing never pushes the rest of the form down the screen.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  hideLabel = false,
  children,
  className
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className={cn("text-label font-medium text-ink-muted", hideLabel && "sr-only")}
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </label>

      {children}

      <div className="min-h-[1.0625rem]">
        {error ? (
          <p id={`${id}-error`} className="text-label text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-label text-ink-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Shared control surface, so every input in BORO has the same box. */
export const controlClass =
  "w-full rounded-field border bg-surface-raised px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-subtle disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-subtle";

export function controlBorder(hasError: boolean) {
  return hasError ? "border-danger focus:border-danger" : "border-line focus:border-primary";
}

export function describedBy(id: string, hasError: boolean, hasHint: boolean) {
  if (hasError) return `${id}-error`;
  if (hasHint) return `${id}-hint`;
  return undefined;
}
