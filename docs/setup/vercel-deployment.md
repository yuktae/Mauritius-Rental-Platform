# BORO Vercel Deployment

BORO is a pnpm monorepo with two deployable Next.js apps. Each one becomes its
own Vercel project, both connected to the same GitHub repository
`yuktae/Mauritius-Rental-Platform`.

| Vercel project | Root Directory | Serves | Audience |
|---|---|---|---|
| `boro-web` | `apps/web` | Renter and Owner flows | Public |
| `boro-admin` | `apps/admin` | Operator dashboard | Staff only |

Two projects rather than one, because the admin dashboard needs its own domain,
its own access protection, and the service role key must never be present in the
build environment of the public app.

## Branch Mapping

| Git branch | Vercel environment | Supabase project |
|---|---|---|
| `main` | Production | `boro-production` (not created yet) |
| `preprod` | Preview (staging) | `boro-staging` (not created yet) |
| any other branch | Preview | `boro-staging` |

Set this under **Settings > Git > Production Branch = `main`**. The `preprod`
branch then deploys automatically as a preview with a stable URL.

## Project Settings

Apply to **both** projects. Everything except Root Directory is already declared
in each app's `vercel.json`, so the dashboard should pick it up automatically.

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `apps/web` or `apps/admin` |
| Include files outside the root directory | **Enabled** (required: the apps import `packages/*`) |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `next build` |
| Node.js Version | 24.x |

`vercel.json` also sets an `ignoreCommand` per app, so a commit that only touches
`apps/admin` will not rebuild `boro-web`, and vice versa. Changes to `packages/*`
or the lockfile rebuild both.

## Environment Variables

Set these under **Settings > Environment Variables** in each project. Values come
from the Supabase project dashboard under **Settings > API**.

### `boro-web`

| Key | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | production project URL | staging project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production anon key | staging anon key |
| `BORO_ENV` | `production` | `staging` |

### `boro-admin`

| Key | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | production project URL | staging project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production anon key | staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | production service role key | staging service role key |
| `BORO_ENV` | `production` | `staging` |

Rules for `SUPABASE_SERVICE_ROLE_KEY`:

- It belongs to the `boro-admin` project only. Never add it to `boro-web`.
- Never rename it to `NEXT_PUBLIC_*`, and never read it from a Client Component.
  It bypasses every RLS policy in the database.
- Mark it as **Sensitive** in Vercel so it cannot be read back from the dashboard.

## Blocked On Supabase

The hosted Supabase projects do not exist yet. Until `boro-staging` and
`boro-production` are created, the environment variables above have no real
values, and the local URL in `.env` (a `192.168.x.x` LAN address) is unreachable
from Vercel's build and runtime.

This does not block the first deploy: both apps are currently fully static and do
not call Supabase at all. Deploy now to confirm the pipeline, then fill in the
environment variables when the hosted projects exist and the auth code lands.

## Protect The Admin Dashboard

Before `boro-admin` has any real data behind it:

1. **Settings > Deployment Protection > Vercel Authentication** — set to
   *Standard Protection* so only your Vercel team can open the URLs.
2. `apps/admin/vercel.json` already sends `X-Robots-Tag: noindex, nofollow` plus
   `X-Frame-Options: DENY`, so the dashboard stays out of search results and
   cannot be framed.
3. Application-level admin auth and 2FA are still required. Deployment protection
   is a perimeter, not a replacement for the `admin` role check.

## First Deploy Checklist

1. Push the current branch so `vercel.json` and the CI workflows are on GitHub.
2. Vercel dashboard > **Add New > Project** > import
   `yuktae/Mauritius-Rental-Platform`.
3. Set Root Directory to `apps/web`, name it `boro-web`, deploy.
4. Repeat for `apps/admin` as `boro-admin`.
5. Set the production branch to `main` on both.
6. Turn on Deployment Protection for `boro-admin`.
7. Open both preview URLs at phone, tablet, and desktop widths.

## Known Risk: pnpm 11

`package.json` declares `"packageManager": "pnpm@11.19.0"`. Vercel installs the
package manager from that field via corepack, but pnpm 11 is recent enough that
support should be confirmed on the very first build rather than assumed.

If the install step fails with an unknown or unsupported pnpm version:

- Set the environment variable `ENABLE_EXPERIMENTAL_COREPACK=1` on the project, or
- Drop the `packageManager` field and let Vercel select pnpm from the
  `lockfileVersion: '9.0'` in `pnpm-lock.yaml`.

The lockfile is fully pinned, so either path resolves the same dependency tree.

## Note On Install Weight

Vercel runs `pnpm install` at the workspace root, which installs the root dev
dependencies too, including the `supabase` CLI binary (~100MB) that no app needs
at build time. If build minutes become a concern, move `supabase` and `turbo` out
of the root `package.json` into a dedicated tooling package that the apps do not
depend on.
