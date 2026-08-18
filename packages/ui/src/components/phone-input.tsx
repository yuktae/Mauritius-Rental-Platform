"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "../cn";
import { Field, controlBorder, describedBy } from "./field";

export type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type" | "value" | "onChange"
> & {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  /** Local digits only, without the +230. */
  value: string;
  onValueChange: (digits: string) => void;
};

/** Mauritius mobile numbers are 8 local digits, conventionally shown as 5xxx xxxx. */
export function formatMauritiusPhone(digits: string) {
  const clean = digits.replace(/\D/g, "").slice(0, 8);
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)} ${clean.slice(4)}`;
}

export function PhoneInput({
  label = "Phone number",
  hint,
  error,
  id,
  required,
  value,
  onValueChange,
  className,
  ...props
}: PhoneInputProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hasError = Boolean(error);

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required}>
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-field border bg-surface-raised transition-colors focus-within:border-primary",
          hasError ? "border-danger focus-within:border-danger" : "border-line",
          controlBorder(hasError).replace("focus:", "focus-within:")
        )}
      >
        <span className="flex select-none items-center border-r border-line bg-surface-sunken px-4 font-medium text-ink-muted">
          +230
        </span>
        <input
          {...props}
          id={inputId}
          required={required}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="5xxx xxxx"
          value={formatMauritiusPhone(value)}
          onChange={(event) => onValueChange(event.target.value.replace(/\D/g, "").slice(0, 8))}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(inputId, hasError, Boolean(hint))}
          className={cn(
            "w-full bg-transparent px-4 py-3 text-ink outline-none placeholder:text-ink-subtle",
            className
          )}
        />
      </div>
    </Field>
  );
}
