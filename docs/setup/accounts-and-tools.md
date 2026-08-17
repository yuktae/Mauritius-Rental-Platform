# BORO Accounts And Local Tools

## Already Installed On This Machine

| Tool | Status |
|---|---|
| Node.js | Installed |
| pnpm | Installed |
| Git | Installed |
| Docker Desktop | Installed, but Docker config access should be checked |

## Install Now

| Tool | Why |
|---|---|
| Supabase CLI | Required for local Supabase, migrations, seed data, and generated database types. Install as a project dev dependency in BORO, not through `winget`. |
| EAS CLI | Needed for Expo development builds and internal preview builds. |
| Expo Go app on phone | Fast early mobile preview. |
| Android Studio | Android emulator and Android device tooling. |

## Create Now

| Account | Why |
|---|---|
| GitHub account `yuktae` | Host BORO code, pull requests, and deployment connections. |
| Supabase | Create local-linked projects, then staging and production projects. |
| Expo | Run EAS builds, device previews, and internal builds. |

## GitHub Repository Target

Create this when GitHub is healthy again:

| Field | Value |
|---|---|
| Owner | `yuktae` |
| Repository name | `Mauritius-Rental-Platform` |
| Display name | Mauritius Rental Platform |
| Local folder | `C:\Users\yukta\OneDrive\Bureau\BORO` |

## Create Next

| Account | Why |
|---|---|
| Vercel | Recommended first hosting option for the Next.js admin dashboard. |
| Sentry | App and admin error monitoring before beta testing. |
| Analytics provider | PostHog or Firebase Analytics for funnels and product usage. |

## Create Later

| Account | Why |
|---|---|
| Domain registrar | Buy the BORO domain before production email setup. |
| Email provider | Resend, Postmark, or SendGrid after the domain exists. |
| Apple Developer | Required before iOS TestFlight and App Store release. |
| Google Play Console | Required before Play Store internal testing and release. |
| Stripe | Payments, deposit holds, refunds, and owner payouts in a later phase. |

## Not Needed Now

| Tool | Reason |
|---|---|
| EasyPanel | Only useful if BORO self-hosts services on a VPS later. |
| Fly.io | Useful later for custom APIs/workers, but not required for the first Expo + Next.js + Supabase setup. |
| Supabase branching | Useful later for PR previews; separate staging and production projects are better first. |

## Supabase CLI Install Method

`winget install Supabase.CLI` may not find a package. For BORO, use the project-local CLI:

```powershell
cd "C:\Users\yukta\OneDrive\Bureau\BORO"
pnpm install
pnpm exec supabase --version
```

Official Supabase docs support this npm/pnpm project dependency approach. Commands can then run through `pnpm exec supabase` or through package scripts like `pnpm db:start`.
