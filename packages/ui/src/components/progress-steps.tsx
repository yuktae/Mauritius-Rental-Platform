import { cn } from "../cn";

export type ProgressStepsProps = {
  current: number;
  total: number;
  label?: string;
  className?: string;
};

export function ProgressSteps({ current, total, label, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label font-medium text-ink-muted">
          Step {current} of {total}
        </span>
        {label ? <span className="text-label text-ink-subtle">{label}</span> : null}
      </div>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={label ?? `Step ${current} of ${total}`}
      >
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index < current ? "bg-primary" : "bg-line"
            )}
          />
        ))}
      </div>
    </div>
  );
}
