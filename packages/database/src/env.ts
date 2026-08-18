/**
 * Supabase connection settings.
 *
 * These are read as literal `process.env.X` expressions on purpose. Next.js
 * inlines NEXT_PUBLIC_* variables into the browser bundle by statically
 * matching that exact syntax, so a dynamic lookup like `process.env[name]`
 * would silently resolve to undefined in client code.
 *
 * BORO uses Supabase's publishable key, not the legacy anon JWT. The
 * publishable key is designed to ship to the browser; Row Level Security is
 * what protects the data, not the secrecy of this key.
 */

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function readSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length > 0 || !url || !publishableKey) {
    throw new Error(
      `Missing Supabase environment ${
        missing.length === 1 ? "variable" : "variables"
      }: ${missing.join(", ")}. ` +
        "Copy .env.example into apps/<app>/.env.local for local development, " +
        "or set them on the Vercel project for a deployed environment."
    );
  }

  return { url, publishableKey };
}
