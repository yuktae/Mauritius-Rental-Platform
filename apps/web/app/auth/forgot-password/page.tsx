import type { Metadata } from "next";

import { Banner, Button } from "@boro/ui";

import { AuthShell } from "../../../src/features/auth/auth-shell";

export const metadata: Metadata = {
  title: "Reset your BORO password"
};

/** Placeholder until M9, so the link on the sign-in form is never a dead end. */
export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      footer={
        <a href="/" className="font-semibold text-primary hover:underline">
          Back to sign in
        </a>
      }
    >
      <div className="flex flex-col gap-4">
        <Banner tone="info" title="Not built yet">
          Password reset lands after signup and the profile flow.
        </Banner>
        <Button variant="secondary" fullWidth size="lg" disabled>
          Send reset link
        </Button>
      </div>
    </AuthShell>
  );
}
