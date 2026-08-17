import { BRAND_NAME } from "@boro/config";
import { ROLE_LABELS } from "@boro/types";

export default function AdminHomePage() {
  return (
    <main className="admin-shell">
      <section>
        <p className="kicker">Initial admin shell</p>
        <h1>{BRAND_NAME} Admin</h1>
        <p>
          This dashboard will be protected for {ROLE_LABELS.admin.en} /{" "}
          {ROLE_LABELS.admin.fr} / {ROLE_LABELS.admin.mfe} users only.
        </p>
      </section>

      <section className="grid" aria-label="Phase 1 admin modules">
        <article>Pending user reviews</article>
        <article>Pending listing approvals</article>
        <article>Active bookings</article>
        <article>Dispute queue</article>
      </section>
    </main>
  );
}
