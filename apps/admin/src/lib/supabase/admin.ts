import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@boro/database";

/**
 * Supabase client authenticated with the secret key.
 *
 * This bypasses every Row Level Security policy. Use it only for operator
 * actions that genuinely need to act across users, and prefer the audited
 * SECURITY DEFINER functions where one exists:
 *
 *   admin_set_id_verification_status()
 *   admin_set_account_status()
 *
 * Those enforce the admin role, require a reason, refuse self-targeting and
 * write to admin_actions. Going around them through this client means the
 * action is neither attributed nor audited.
 *
 * The `server-only` import above makes the build fail if this module is ever
 * reached from a Client Component, rather than leaking the key into a bundle.
 */
export function createBoroAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    const missing = [
      !url && "NEXT_PUBLIC_SUPABASE_URL",
      !secretKey && "SUPABASE_SECRET_KEY"
    ].filter(Boolean);
    throw new Error(
      `Missing Supabase admin environment: ${missing.join(", ")}. ` +
        "SUPABASE_SECRET_KEY belongs to the boro-admin project only."
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export type BoroAdminClient = ReturnType<typeof createBoroAdminClient>;
