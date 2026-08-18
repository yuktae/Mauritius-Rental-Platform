"use client";

import { useId, type ReactNode } from "react";

import { cn } from "../cn";

export type ConsentCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  error?: string;
  disabled?: boolean;
};

export function ConsentCheckbox({
  checked,
  onCheckedChange,
  children,
  error,
  disabled = false
}: ConsentCheckboxProps) {
  const id = useId();
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={cn(
            "mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border-2 accent-[var(--color-primary)]",
            hasError ? "border-danger" : "border-line-strong"
          )}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-ink-muted">
          {children}
        </label>
      </div>
      <div className="min-h-[1.0625rem] pl-8">
        {hasError ? (
          <p id={`${id}-error`} className="text-label text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
