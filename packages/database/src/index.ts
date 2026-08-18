export type { Database, Json } from "./supabase.types";
export type { SupabasePublicConfig } from "./env";
export { readSupabasePublicConfig } from "./env";

// Clients are exported from subpaths so that server-only code, which imports
// next/headers, never reaches a client bundle:
//
//   @boro/database/browser      Client Components
//   @boro/database/server       Server Components, Actions, Route Handlers
//   @boro/database/middleware   middleware.ts
