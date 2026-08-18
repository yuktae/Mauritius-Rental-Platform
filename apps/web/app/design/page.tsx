import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  brandRamp,
  sandRamp,
  statusColors,
  ownerAccentCandidates,
  typeScale,
  radii,
  type Ramp
} from "@boro/ui";

export const metadata: Metadata = {
  title: "BORO design tokens",
  robots: { index: false, follow: false }
};

function RampBlock({ ramp }: { ramp: Ramp }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-title font-semibold">{ramp.name}</h2>
        <p className="max-w-prose text-sm text-ink-muted">{ramp.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ramp.swatches.map((swatch) => (
          <div
            key={swatch.step}
            className="overflow-hidden rounded-card border border-line bg-surface-raised"
          >
            <div className="h-14 w-full" style={{ background: swatch.value }} />
            <div className="flex flex-col gap-0.5 px-3 py-2.5">
              <span className="font-mono text-label font-semibold">
                {ramp.token}-{swatch.step}
              </span>
              <span className="font-mono text-xs tabular-nums text-ink-subtle">
                {swatch.value}
              </span>
              {swatch.note ? (
                <span className="mt-1 text-xs leading-snug text-ink-muted">
                  {swatch.note}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DesignTokensPage() {
  // Never reachable in production. This page exists so the palette can be
  // approved on a real device from the preprod preview URL.
  if (process.env.BORO_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-label uppercase tracking-[0.14em] text-ink-subtle">
          Not shipped &middot; preview only
        </span>
        <h1 className="text-display font-extrabold">Design tokens</h1>
        <p className="max-w-prose text-ink-muted">
          Two ramps, four status colours, one swappable role accent. Everything
          warm on a BORO screen is a step on the orange ramp, and the neutrals
          carry an orange bias so cream and grey read as relatives rather than
          strangers.
        </p>
      </header>

      <RampBlock ramp={brandRamp} />
      <RampBlock ramp={sandRamp} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-title font-semibold">Status</h2>
          <p className="max-w-prose text-sm text-ink-muted">
            Each one is pushed away from orange so it reads as a state rather
            than as brand. Warning sits at a yellow hue for exactly that reason.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statusColors.map((status) => (
            <div
              key={status.step}
              className="overflow-hidden rounded-card border border-line bg-surface-raised"
            >
              <div className="h-14 w-full" style={{ background: status.value }} />
              <div className="flex flex-col gap-0.5 px-3 py-2.5">
                <span className="font-mono text-label font-semibold">
                  {status.step}
                </span>
                <span className="font-mono text-xs tabular-nums text-ink-subtle">
                  {status.value}
                </span>
                <span className="mt-1 text-xs leading-snug text-ink-muted">
                  {status.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-title font-semibold">Owner accent</h2>
          <p className="max-w-prose text-sm text-ink-muted">
            Renter and Owner share every token and differ only in the accent,
            so the distinction stays one line rather than two themes that drift.
            Ink navy is the choice; the rejected options stay here because the
            reasoning matters more than the result if this is revisited.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ownerAccentCandidates.map((candidate) => (
            <div
              key={candidate.step}
              className="flex items-center gap-4 rounded-card border border-line bg-surface-raised p-4"
            >
              <button
                type="button"
                className="shrink-0 rounded-control px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: candidate.value }}
              >
                Book now
              </button>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {candidate.step}
                  {candidate.chosen ? (
                    <span className="rounded-control bg-trust-soft px-2 py-0.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-trust">
                      Chosen
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-xs tabular-nums text-ink-subtle">
                  {candidate.value}
                </span>
                <span className="mt-0.5 text-xs leading-snug text-ink-muted">
                  {candidate.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-title font-semibold">Type</h2>
        <div className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-raised">
          <div className="flex flex-col gap-1 px-4 py-4">
            <span className="text-display font-extrabold">Find. Book. Return.</span>
            <span className="font-mono text-xs text-ink-subtle">text-display</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4">
            <span className="text-title font-semibold">Weekend picks near you</span>
            <span className="font-mono text-xs text-ink-subtle">text-title</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4">
            <span>
              Rent what you need, list what you own. BORO runs from a web link on
              phones, tablets and desktop.
            </span>
            <span className="font-mono text-xs text-ink-subtle">text-base</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4">
            <span className="text-label uppercase tracking-wide text-ink-muted">
              Email address
            </span>
            <span className="font-mono text-xs text-ink-subtle">text-label</span>
          </div>
        </div>
        <ul className="flex flex-col gap-1 text-sm text-ink-muted">
          {typeScale.map((entry) => (
            <li key={entry.name}>
              <code className="font-mono text-xs text-ink">{entry.token}</code>
              {" — "}
              {entry.use}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-title font-semibold">Controls and shape</h2>
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-control bg-primary px-6 py-3 font-semibold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-press"
            >
              Continue
            </button>
            <button
              type="button"
              className="rounded-control border border-line-strong px-6 py-3 font-semibold transition-colors hover:bg-surface-sunken"
            >
              Filter
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-control bg-surface-sunken px-6 py-3 font-semibold text-ink-subtle"
            >
              Disabled
            </button>
            <span className="rounded-control bg-trust-soft px-4 py-2 text-sm font-semibold text-trust">
              ID verified
            </span>
            <span className="rounded-control bg-warning-soft px-4 py-2 text-sm font-semibold text-warning">
              Pending review
            </span>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-ink-muted">
              Email address
            </span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-field border border-line bg-surface-raised px-4 py-3 outline-none placeholder:text-ink-subtle focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-ink-muted">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              defaultValue="wrongpassword"
              aria-invalid="true"
              className="w-full rounded-field border border-danger bg-surface-raised px-4 py-3 outline-none focus:border-danger"
            />
            <span className="text-label text-danger">
              That email and password don&rsquo;t match.
            </span>
          </label>

          <div className="flex flex-wrap gap-3 pt-1">
            {radii.map((radius) => (
              <div
                key={radius.name}
                className={`flex h-16 w-28 items-center justify-center border border-line bg-surface-sunken ${radius.token}`}
              >
                <span className="font-mono text-xs text-ink-muted">
                  {radius.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
