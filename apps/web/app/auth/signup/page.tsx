import type { Metadata } from "next";

import { Banner, Button } from "@boro/ui";

import { AuthShell } from "../../../src/features/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create your BORO account"
};

/**
 * Placeholder until M5.
 *
 * It exists so the link from the sign-in form goes somewhere honest rather than
 * a 404 while the real screen is built. Signup needs role intent, consent
 * timestamps and the OTP handoff, which is a screen of its own, not a field
 * added here.
 */
export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose whether you want to rent, list, or both."
      footer={
        <>
          Already have an account?{" "}
          <a href="/" className="font-semibold text-primary hover:underline">
            Sign in
          </a>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Banner tone="info" title="This screen is next">
          Signup is the following milestone: role choice, terms and privacy
          consent, then the six-digit code we email you.
        </Banner>
        <Button variant="secondary" fullWidth size="lg" disabled>
          Create account
        </Button>
      </div>
    </AuthShell>
  );
}
