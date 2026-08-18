import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { readSupabasePublicConfig } from "./env";
import type { Database } from "./supabase.types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Must be created per request, never hoisted to module scope, because it
 * closes over that request's cookies.
 *
 * Always authenticate with `supabase.auth.getUser()`. Never trust
 * `getSession()` on the server: it reads the cookie without revalidating it
 * against the auth server, so its contents can be spoofed.
 */
export async function createBoroServerClient() {
  // cookies() first, deliberately. Awaiting it is what marks the route dynamic,
  // so Next stops trying to prerender it. Reading env before this point means a
  // missing variable throws during prerender and fails the entire build, rather
  // than failing the one request that is actually misconfigured.
  const cookieStore = await cookies();
  const { url, publishableKey } = readSupabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. This is safe to ignore
          // because the middleware refreshes the session on every request.
        }
      }
    }
  });
}

export type BoroServerClient = Awaited<ReturnType<typeof createBoroServerClient>>;
