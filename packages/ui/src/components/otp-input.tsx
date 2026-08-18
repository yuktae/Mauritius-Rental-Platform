"use client";

import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "../cn";

export type OtpStatus = "idle" | "error" | "success";

export type OtpInputProps = {
  value: string;
  onValueChange: (code: string) => void;
  /** Fires once the last box is filled. */
  onComplete?: (code: string) => void;
  length?: number;
  status?: OtpStatus;
  disabled?: boolean;
  label?: string;
  error?: string;
};

/**
 * Six separate boxes that behave like one field.
 *
 * Paste fills every box, typing advances, backspace on an empty box steps back,
 * and the first box carries autocomplete="one-time-code" so the phone offers
 * the code from the email or SMS.
 */
export function OtpInput({
  value,
  onValueChange,
  onComplete,
  length = 6,
  status = "idle",
  disabled = false,
  label = "Verification code",
  error
}: OtpInputProps) {
  const groupId = useId();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  function commit(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onValueChange(clean);
    if (clean.length === length) onComplete?.(clean);
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = value.slice(0, index) + digit + value.slice(index + 1);
    commit(next);
    inputs.current[Math.min(index + 1, length - 1)]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index));
        inputs.current[index - 1]?.focus();
      }
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    commit(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  const boxTone =
    status === "success"
      ? "border-trust bg-trust-soft text-trust"
      : status === "error"
        ? "border-danger text-ink"
        : "border-line text-ink focus:border-primary";

  return (
    <div className="flex flex-col gap-1.5">
      <span id={groupId} className="text-label font-medium text-ink-muted">
        {label}
      </span>

      <div className="flex gap-2" role="group" aria-labelledby={groupId}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            value={digits[index]?.trim() ?? ""}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={status === "error" || undefined}
            className={cn(
              "min-h-14 w-full min-w-0 rounded-field border bg-surface-raised text-center text-xl font-semibold tabular-nums outline-none transition-colors disabled:cursor-not-allowed disabled:bg-surface-sunken",
              boxTone
            )}
          />
        ))}
      </div>

      <div className="min-h-[1.0625rem]">
        {error ? <p className="text-label text-danger">{error}</p> : null}
        {status === "success" && !error ? (
          <p className="text-label font-medium text-trust">Code verified</p>
        ) : null}
      </div>
    </div>
  );
}
