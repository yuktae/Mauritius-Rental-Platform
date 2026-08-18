import { cn } from "../cn";

/**
 * Sized in em so it matches whatever text it sits beside.
 *
 * motion-safe means the ring stops rotating under reduced-motion rather than
 * animating at a broken speed. The button still reads as busy through its
 * label and aria-busy.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-[1.1em] shrink-0 motion-safe:animate-spin", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
