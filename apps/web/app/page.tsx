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

export default function WebHomePage() {
  return (
    <main className="shell">
      <nav className="topbar" aria-label="Primary navigation">
        <strong>{BRAND_NAME}</strong>
        <div>
          <a href="#login">Login</a>
          <a href="#signup">Sign up</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Phone-first web platform</p>
          <h1>Rent what you need, list what you own.</h1>
          <p>
            BORO will run from a web link on phones, tablets, and desktop. The
            phone layout is structured like an app, while desktop can grow into
            richer search, filters, and owner tools.
          </p>
          <div className="actions">
            <a className="primary-action" href="#signup">
              Start with BORO
            </a>
            <a className="secondary-action" href="#roles">
              View roles
            </a>
          </div>
        </div>

        <aside className="preview-panel" aria-label="Responsive preview notes">
          <span>Adaptive layout</span>
          <h2>One codebase. Different structures.</h2>
          <p>
            Mobile, tablet, and desktop will share data and logic, but use
            layouts built for each screen.
          </p>
        </aside>
      </section>

      <section className="role-grid" id="roles" aria-label="BORO roles">
        <article>
          <span>01</span>
          <h2>{ROLE_LABELS.renter.en}</h2>
          <p>
            {ROLE_LABELS.renter.fr} / {ROLE_LABELS.renter.mfe}
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>{ROLE_LABELS.owner.en}</h2>
          <p>
            {ROLE_LABELS.owner.fr} / {ROLE_LABELS.owner.mfe}
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>{ROLE_LABELS.admin.en}</h2>
          <p>
            {ROLE_LABELS.admin.fr} / {ROLE_LABELS.admin.mfe}
          </p>
        </article>
      </section>

      <section className="module-list" aria-label="Phase 1 web modules">
        <h2>Phase 1 foundation</h2>
        <div>
          {modules.map((module) => (
            <p key={module}>{module}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
