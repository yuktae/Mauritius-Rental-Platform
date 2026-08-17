# BORO Initial Development Setup Plan

This plan starts the BORO development workspace without building the full app yet.

## Do Now

- [x] Use `C:\Users\yukta\OneDrive\Bureau\BORO` as the code workspace.
- [x] Keep `C:\Users\yukta\OneDrive\Bureau\RENTAL SITE\docs` as the product/design/technical source of truth.
- [x] Create the monorepo folder structure.
- [x] Add root `pnpm` workspace config.
- [x] Add web, admin, shared package, and Supabase skeletons.
- [x] Remove Expo/mobile app direction after product pivot to responsive web.
- [x] Install Supabase CLI as a BORO project dev dependency.
- [x] Run `pnpm install`.
- [x] Run local Supabase with Docker.
- [ ] Preview the web app in phone/tablet/desktop browser sizes.

## Do Next

- [x] Confirm local Docker Desktop is healthy.
- [x] Create local Supabase anon/service keys by running `supabase start`.
- [x] Fill local env files from `.env.example`.
- [x] Generate database types into `packages/database`.
- [ ] Build the real login screen.
- [ ] Build the signup screen.
- [ ] Build email OTP verification.
- [ ] Build mandatory profile setup.
- [ ] Implement the shared role-based routing decision.
- [ ] Build Renter homepage shell.
- [ ] Build Owner homepage shell.
- [ ] Build Admin dashboard shell.
- [ ] Run BORO in a physical phone browser.

## Do Later

- [ ] Create `boro-staging` Supabase project.
- [ ] Create `boro-production` Supabase project.
- [ ] Add production email provider after the BORO domain is purchased.
- [ ] Add Sentry and analytics.
- [ ] Add admin 2FA before launch.
- [ ] Add payments, deposit holds, and payouts in a later phase.

## Environment Strategy

| Environment | Backend | Purpose |
|---|---|---|
| Local | Supabase CLI + Docker | Developer testing |
| Staging / Preprod | Separate Supabase project | Beta/internal testing with test data |
| Production | Separate Supabase project | Real users and real identity data |

Use separate Supabase projects first because this is simpler and safer. Supabase branching can be added later for pull request previews.

## Account Checklist For The Owner

| Account or tool | Needed | Timing |
|---|---:|---|
| GitHub account | Yes | Now |
| Supabase account | Yes | Now |
| Domain for BORO | Yes | Before production email and public launch |
| Email provider account | Yes | After domain purchase |
| Vercel account | Recommended | Now, for preprod and production web hosting |
| Sentry account | Recommended | Later, before beta |
| Analytics account | Recommended | Later, before beta |
| Stripe account | Later | Payments/deposits/payout phase |

## Open Decisions

- Final domain name for BORO.
- Production email provider after the domain is purchased.
- Whether staging remains a separate Supabase project long term or later moves to Supabase branching for preview environments.
