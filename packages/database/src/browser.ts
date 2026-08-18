import { createBrowserClient } from "@supabase/ssr";

import { readSupabasePublicConfig } from "./env";
import type { Database } from "./supabase.types";

/**
 * Supabase client for Client Components and browser-side code.
 *
 * Safe to call repeatedly: @supabase/ssr returns the same underlying instance
 * per browser context, so components do not need to share one through props
 * or context.
 */
export function createBoroBrowserClient() {
  const { url, publishableKey } = readSupabasePublicConfig();
  return createBrowserClient<Database>(url, publishableKey);
}

export type BoroBrowserClient = ReturnType<typeof createBoroBrowserClient>;
