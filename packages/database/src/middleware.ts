import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

import { readSupabasePublicConfig } from "./env";
import type { Database } from "./supabase.types";

/**
 * Refreshes the Supabase session on every request and reports who is signed in.
 *
 * Server Components cannot write cookies, so without this the access token
 * would expire and users would be silently signed out. Each app wires this
 * into its own middleware.ts and decides what to do with the result.
 *
 * The returned response carries the refreshed auth cookies. Callers that
 * redirect must copy those cookies onto the redirect response, otherwise the
 * refresh is lost.
 */
export async function updateBoroSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  const { url, publishableKey } = readSupabasePublicConfig();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      }
    }
  });

  // getUser revalidates the token with the auth server. Do not swap this for
  // getSession, which only decodes the cookie.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { response, user };
}
