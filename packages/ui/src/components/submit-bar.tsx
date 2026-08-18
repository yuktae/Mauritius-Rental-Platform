import type { ReactNode } from "react";

import { cn } from "../cn";

export type SubmitBarProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Bottom-anchored on a phone, inline from tablet up.
 *
 * Top-right buttons are unreachable one-handed on a 6.7 inch screen, and the
 * safe-area inset keeps the bar clear of the home indicator.
 */
export function SubmitBar({ children, className }: SubmitBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 border-t border-line bg-surface/95 px-5 pt-3 backdrop-blur",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none",
        className
      )}
    >
      {children}
    </div>
  );
}
