"use client";

import type { ReactNode } from "react";

import { cn } from "../cn";

export type RoleChoiceCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  disabled?: boolean;
};

/**
 * Role intent at signup. Multi-select, because someone can be both a Renter
 * and an Owner, so these are checkboxes rather than radios.
 */
export function RoleChoiceCard({
  title,
  subtitle,
  description,
  selected,
  onToggle,
  icon,
  disabled = false
}: RoleChoiceCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-card border-2 p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary-soft"
          : "border-line bg-surface-raised hover:border-line-strong",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          selected ? "border-primary bg-primary text-on-primary" : "border-line-strong"
        )}
      >
        {selected ? (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">{title}</span>
          {subtitle ? <span className="text-label text-ink-subtle">{subtitle}</span> : null}
        </span>
        <span className="text-sm leading-snug text-ink-muted">{description}</span>
      </span>

      {icon ? <span className="ml-auto shrink-0 text-ink-subtle">{icon}</span> : null}
    </button>
  );
}
