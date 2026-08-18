import { BRAND_NAME } from "@boro/config";
import { ROLE_LABELS } from "@boro/types";

const queues = [
  { label: "Pending user reviews", tone: "warning" },
  { label: "Pending listing approvals", tone: "warning" },
  { label: "Active bookings", tone: "trust" },
  { label: "Dispute queue", tone: "danger" }
] as const;

const toneClass = {
  warning: "bg-warning-soft text-warning",
  trust: "bg-trust-soft text-trust",
  danger: "bg-danger-soft text-danger"
} as const;

export default function AdminHomePage() {
  return (
    <div
      data-surface="owner"
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-12"
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-label uppercase tracking-[0.14em] text-ink-subtle">
          Initial admin shell
        </span>
        <h1 className="text-display font-extrabold">{BRAND_NAME} Admin</h1>
        <p className="max-w-prose text-ink-muted">
          This dashboard will be protected for {ROLE_LABELS.admin.en} /{" "}
          {ROLE_LABELS.admin.fr} / {ROLE_LABELS.admin.mfe} users only. The role
          check is not built yet, so nothing here is gated.
        </p>
      </header>

      <section className="flex flex-col gap-3" aria-label="Phase 1 admin queues">
        <h2 className="text-title font-semibold">Queues</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {queues.map((queue) => (
            <article
              key={queue.label}
              className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface-raised p-5"
            >
              <span className="font-semibold">{queue.label}</span>
              <span
                className={`rounded-control px-3 py-1.5 font-mono text-xs font-semibold ${toneClass[queue.tone]}`}
              >
                empty
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
