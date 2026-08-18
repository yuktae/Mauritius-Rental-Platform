"use client";

import { useId, useState, type ComponentPropsWithRef, type KeyboardEvent } from "react";

import { cn } from "../cn";
import { Field, controlClass, controlBorder, describedBy } from "./field";

export type PasswordInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type"
> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  /** Signup only. A login form should never grade an existing password. */
  showStrength?: boolean;
};

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["bg-line-strong", "bg-danger", "bg-warning", "bg-brand-400", "bg-success"];

export function scorePassword(value: string): number {
  if (value.length === 0) return 0;
  if (value.length < 10) return 1;
  let score = 2;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1;
  return Math.min(score, 4);
}

export function PasswordInput({
  label,
  hint,
  error,
  id,
  required,
  showStrength = false,
  className,
  value,
  onKeyUp,
  ...props
}: PasswordInputProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const [revealed, setRevealed] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const hasError = Boolean(error);

  const text = typeof value === "string" ? value : "";
  const score = scorePassword(text);

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    setCapsOn(event.getModifierState?.("CapsLock") ?? false);
    onKeyUp?.(event);
  }

  return (
    <Field
      id={inputId}
      label={label}
      hint={capsOn ? "Caps Lock is on" : hint}
      error={error}
      required={required}
    >
      <div className="relative">
        <input
          {...props}
          value={value}
          onKeyUp={handleKeyUp}
          id={inputId}
          required={required}
          type={revealed ? "text" : "password"}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(inputId, hasError, Boolean(hint) || capsOn)}
          className={cn(controlClass, controlBorder(hasError), "pr-20", className)}
        />
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          aria-pressed={revealed}
          className="absolute inset-y-0 right-0 flex min-h-12 items-center rounded-r-field px-4 text-label font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          {revealed ? "Hide" : "Show"}
        </button>
      </div>

      {showStrength ? (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((segment) => (
              <span
                key={segment}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  segment < score ? strengthColors[score] : "bg-line"
                )}
              />
            ))}
          </div>
          <p className="text-label text-ink-subtle" aria-live="polite">
            {text.length === 0 ? "At least 10 characters" : strengthLabels[score]}
          </p>
        </div>
      ) : null}
    </Field>
  );
}
