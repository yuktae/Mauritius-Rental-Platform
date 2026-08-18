import { redirect } from "next/navigation";

import { createBoroServerClient } from "@boro/database/server";
import { Button, ResultScreen } from "@boro/ui";

import { signOutAction } from "../../../src/features/auth/actions";

/**
 * Confirms a sign-in actually took.
 *
 * Reads the session server-side rather than trusting a query parameter, so
 * landing here without a session sends you back to the form instead of
 * cheerfully announcing success to someone who is not signed in.
 */
export default async function SignedInPage() {
  const supabase = await createBoroServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <ResultScreen
      status="success"
      title="You're in"
      description={
        <>
          Signed in as <span className="font-semibold text-ink">{user.email}</span>.
          The Renter and Owner homepages arrive with the routing gate, so there is
          nowhere further to go just yet.
        </>
      }
      primaryAction={
        <form action={signOutAction} className="contents">
          <Button type="submit" variant="secondary" fullWidth>
            Sign out
          </Button>
        </form>
      }
    />
  );
}
