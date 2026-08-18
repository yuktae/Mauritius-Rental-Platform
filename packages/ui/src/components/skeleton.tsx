import { cn } from "../cn";

/**
 * Shaped like the content it stands in for, so nothing shifts when the real
 * thing arrives. Prefer this over a spinner wherever the shape is known.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block rounded-md bg-surface-sunken motion-safe:animate-pulse",
        className
      )}
    />
  );
}
