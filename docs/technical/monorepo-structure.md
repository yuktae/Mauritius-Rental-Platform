# BORO Monorepo Structure

```text
apps/
  mobile/
  admin/

packages/
  ui/
  types/
  validators/
  config/
  database/

supabase/
  migrations/
  functions/
  seed.sql
  config.toml

docs/
  product/
  design/
  technical/
  setup/
```

## Apps

| Folder | Purpose |
|---|---|
| `apps/mobile` | Expo React Native app for Renter and Owner flows. |
| `apps/admin` | Separate Next.js dashboard for Admin / Opérateur / Operater users. |

## Packages

| Folder | Purpose |
|---|---|
| `packages/ui` | Shared BORO visual tokens and later shared components. |
| `packages/types` | Shared roles, statuses, category keys, and domain types. |
| `packages/validators` | Shared validation for signup, login, profile, listings, and bookings. |
| `packages/config` | Shared brand constants, route paths, environment names, and storage bucket names. |
| `packages/database` | Supabase generated TypeScript types and database helper exports. |

## Supabase

| Folder | Purpose |
|---|---|
| `supabase/migrations` | Version-controlled schema and RLS changes. |
| `supabase/functions` | Edge Functions later for secure actions, webhooks, verification callbacks, and payments. |
| `supabase/seed.sql` | Local seed data. |
| `supabase/config.toml` | Local Supabase configuration. |
