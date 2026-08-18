import { createBoroServerClient } from "@boro/database/server";
import { Button } from "@boro/ui";

import { AuthShell } from "../src/features/auth/auth-shell";
import { LoginForm } from "../src/features/auth/login-form";
import { signOutAction } from "../src/features/auth/actions";

/**
 * The front door is the sign-in form. There is no marketing landing page.
 *
 * When guest browsing arrives (renters can view categories and items without an
 * account, per the Phase 1 spec), this route becomes browse and sign-in moves to
 * /auth/login. The screen itself lives in src/features/auth, so that move is a
 * change to this file alone.
 */
export default async function HomePage() {
  const supabase = await createBoroServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <AuthShell
        title="You're signed in"
        subtitle={`Signed in as ${user.email}. The Renter and Owner homepages are not built yet, so this is where the trail currently ends.`}
      >
        <form action={signOutAction} className="flex flex-col gap-3">
          <Button type="submit" variant="secondary" fullWidth size="lg">
            Sign out
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to book what you need, or manage what you own."
      footer={
        <>
          New to BORO?{" "}
          <a href="/auth/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </a>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
