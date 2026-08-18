# BORO Supabase Clients

BORO uses Supabase's **publishable/secret** API keys, not the legacy
anon/service_role JWTs. The publishable key is designed to reach the browser.
Row Level Security is what protects data, not the secrecy of that key.

## Which client to use

| Context | Import | Notes |
|---|---|---|
| Client Component | `@boro/database/browser` | `createBoroBrowserClient()` |
| Server Component, Server Action, Route Handler | `@boro/database/server` | `await createBoroServerClient()` |
| `middleware.ts` | `@boro/database/middleware` | `updateBoroSession(request)` |
| Admin operator actions | `apps/admin/src/lib/supabase/admin` | `createBoroAdminClient()`, secret key |

Clients live on subpaths so that server-only code, which imports `next/headers`,
can never be pulled into a client bundle. Importing `@boro/database` on its own
gives you types only and is safe anywhere.

## Rules

**Always authenticate with `getUser()`, never `getSession()`.** On the server,
`getSession()` only decodes the cookie without revalidating it against the auth
server, so its contents can be forged. `getUser()` makes a real check.

**Create server clients per request.** They close over that request's cookies,
so a module-scope instance would leak one user's session into another's request.

**Never import the admin client outside `apps/admin`.** It uses the secret key
and bypasses every RLS policy. It carries `import "server-only"`, so a Client
Component reaching it fails the build rather than leaking the key.

## Prefer the audited admin functions

For privileged profile transitions, call the database functions rather than
writing to the table:

```ts
await supabase.rpc("admin_set_id_verification_status", {
  target_user_id: userId,
  new_status: "id_verified",
  reason: "documents match"
});

await supabase.rpc("admin_set_account_status", {
  target_user_id: userId,
  new_status: "suspended",
  reason: "repeated no-shows"
});
```

They enforce the admin role, require a reason for rejections and suspensions,
refuse self-targeting, and write a row to `admin_actions`. A direct table write
through the secret key is neither attributed nor audited, and the protected
columns are blocked for ordinary users by column grants plus a guard trigger.

## Session refresh

Both apps run `updateBoroSession` in `middleware.ts`. Server Components cannot
write cookies, so without it the access token expires mid-session and users are
silently signed out.

Neither middleware gates routes yet. Adding an admin role check before a sign-in
page exists would lock everyone out. That check is the first thing to add once
auth lands, and it is required regardless of Vercel Deployment Protection, which
does not cover the production domain on the current plan.

## Environment variables

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for both
apps; `SUPABASE_SECRET_KEY` for `apps/admin` only. See `.env.example`.

These are read as literal `process.env.X` expressions in
`packages/database/src/env.ts`. Next.js inlines `NEXT_PUBLIC_*` into the browser
bundle by matching that exact syntax, so a dynamic lookup such as
`process.env[name]` resolves to undefined in client code.
