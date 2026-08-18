import type { NextRequest } from "next/server";

import { updateBoroSession } from "@boro/database/middleware";

/**
 * Keeps the Supabase session alive.
 *
 * Server Components cannot write cookies, so without this the access token
 * would expire mid-session and sign the user out. Route protection is not here
 * yet; it arrives with the auth flows, which need somewhere to redirect to
 * first.
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
