import { BRAND_NAME } from "@boro/config";
import { ROLE_LABELS } from "@boro/types";

const modules = [
  "Login and signup",
  "Email OTP verification",
  "Mandatory profile setup",
  "ID verification status",
  "Renter and owner routing",
  "Responsive listing discovery"
];

const roles = [
  { key: "renter", labels: ROLE_LABELS.renter },
  { key: "owner", labels: ROLE_LABELS.owner },
  { key: "admin", labels: ROLE_LABELS.admin }
] as const;

export default function WebHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pb-16 pt-5 sm:px-8 sm:pt-8 lg:gap-16">
      <nav
        className="flex items-center justify-between gap-4"
        aria-label="Primary"
      >
        <span className="text-xl font-extrabold tracking-tight text-primary">
          {BRAND_NAME}
        </span>
        <div className="flex items-center gap-1.5">
          <a
            href="#login"
            className="rounded-control px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-sunken"
          >
            Login
          </a>
          <a
            href="#signup"
            className="rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-press"
          >
            Sign up
          </a>
        </div>
      </nav>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-stretch lg:gap-8">
        <div className="flex flex-col justify-center gap-5">
          <span className="font-mono text-label uppercase tracking-[0.14em] text-ink-subtle">
            Phone-first web platform
          </span>
          <h1 className="text-display font-extrabold text-balance">
            Rent what you need, list what you own.
          </h1>
          <p className="max-w-prose text-ink-muted">
            {BRAND_NAME} runs from a web link on phones, tablets and desktop. The
            phone layout is structured like an app, while desktop grows into
            richer search, filters and owner tools.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <a
              href="#signup"
              className="rounded-control bg-primary px-6 py-3.5 text-center font-semibold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-press"
            >
              Start with {BRAND_NAME}
            </a>
            <a
              href="#roles"
              className="rounded-control border border-line-strong px-6 py-3.5 text-center font-semibold transition-colors hover:bg-surface-sunken"
            >
              View roles
            </a>
          </div>
        </div>

        <aside
          className="flex flex-col justify-end gap-3 rounded-panel bg-gradient-to-br from-brand-300 to-brand-500 p-6 text-white sm:p-8"
          aria-label="Responsive approach"
        >
          <span className="font-mono text-label uppercase tracking-[0.14em] text-white/80">
            Adaptive layout
          </span>
          <h2 className="text-title font-bold text-balance">
            One codebase. Different structures.
          </h2>
          <p className="text-sm leading-relaxed text-white/90">
            Mobile, tablet and desktop share data and logic, but use layouts
            built for each screen.
          </p>
        </aside>
      </section>

      <section id="roles" className="flex flex-col gap-4" aria-label="Roles">
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((role, index) => (
            <article
              key={role.key}
              className="flex flex-col gap-2 rounded-card border border-line bg-surface-raised p-5"
            >
              <span className="font-mono text-label tabular-nums text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-bold">{role.labels.en}</h3>
              <p className="text-sm text-ink-muted">
                {role.labels.fr} / {role.labels.mfe}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-label="Phase 1 modules">
        <h2 className="text-title font-semibold">Phase 1 foundation</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <li
              key={module}
              className="rounded-card bg-surface-sunken px-4 py-3 text-sm font-medium"
            >
              {module}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
