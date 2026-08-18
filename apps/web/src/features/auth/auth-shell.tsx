import type { ReactNode } from "react";

import { BRAND_NAME } from "@boro/config";

export type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Sits under the form: the switch to signup, or back to login. */
  footer?: ReactNode;
};

/**
 * The frame every auth screen sits in.
 *
 * Three layouts, one form. On a phone it is a single column with the action at
 * the bottom where a thumb reaches. From tablet it becomes a centred card. From
 * desktop a brand panel takes the left half, because a 1400px-wide login form
 * looks like a mistake.
 *
 * Only the shell changes across breakpoints; the form inside is the same
 * component, so there is no second implementation to keep in step.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel: desktop only. It is decoration, so it is hidden from
          assistive tech rather than read out before the form. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-gradient-to-br from-brand-300 via-brand-400 to-brand-600 p-12 lg:flex lg:flex-col lg:justify-between"
      >
        <span className="text-2xl font-extrabold tracking-tight text-white">
          {BRAND_NAME}
        </span>

        <div className="flex flex-col gap-4">
          <p className="max-w-[14ch] text-[3.25rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white text-balance">
            Rent what you need.
          </p>
          <p className="max-w-[38ch] text-lg leading-relaxed text-white/90">
            List what you own, and earn from it between uses. Verified people,
            protected deposits, proof at handover.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-white/75">
          <span>Verified identity</span>
          <span>Deposit held</span>
          <span>QR handover</span>
        </div>
      </aside>

      <main className="flex min-h-[100dvh] flex-col px-5 py-6 sm:items-center sm:justify-center sm:px-8 lg:min-h-0 lg:px-12">
        <div className="flex w-full flex-1 flex-col sm:max-w-[26rem] sm:flex-none">
          <span className="text-xl font-extrabold tracking-tight text-primary lg:hidden">
            {BRAND_NAME}
          </span>

          <div className="flex flex-1 flex-col pt-8 sm:pt-0 lg:pt-0">
            <header className="flex flex-col gap-2 pb-6 sm:pb-7">
              <h1 className="text-display font-extrabold text-balance">{title}</h1>
              {subtitle ? (
                <p className="text-pretty text-ink-muted">{subtitle}</p>
              ) : null}
            </header>

            {children}

            {footer ? (
              <div className="pt-6 text-center text-sm text-ink-muted">{footer}</div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
