import type { NextRequest } from "next/server";

import { updateBoroSession } from "@boro/database/middleware";

/**
 * Keeps the Supabase session alive.
 *
 * Server Components cannot write cookies, so without this the access token
 * would expire mid-session and sign the user out.
 *
 * This does NOT yet gate the dashboard on the admin role. Adding that before
 * the sign-in page exists would lock everyone out, including you. It is the
 * first thing to add once auth lands, and it is required regardless of Vercel
 * Deployment Protection, which does not cover the production domain on the
 * current plan.
 */
export async function middleware(request: NextRequest) {
  const { response } = await updateBoroSession(request);
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets. Auth cookies are
    // irrelevant to those and refreshing on them wastes work.
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)"
  ]
};
