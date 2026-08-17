# BORO

BORO is a rental platform monorepo with a mobile app for renters and owners, a separate admin/operator dashboard, shared TypeScript packages, and Supabase for database, auth, storage, and local development.

## Repository Target

When GitHub is healthy, create the repository under:

```text
https://github.com/yuktae/Mauritius-Rental-Platform
```

GitHub repository display name: Mauritius Rental Platform.

## Source Of Truth

Product and setup decisions come from the documents in:

```text
C:\Users\yukta\OneDrive\Bureau\RENTAL SITE\docs
```

Locked setup decisions:

- Product name: BORO
- Public user roles: Renter / Locataire / Lokater and Owner / Propriétaire / Propriyeter
- Admin role: Admin / Opérateur / Operater
- Internal roles: `renter`, `owner`, `admin`
- Local database: Supabase CLI with Docker
- Staging/preprod: separate Supabase project first
- Production: separate Supabase project

## Structure

```text
apps/mobile      Expo React Native app
apps/admin       Next.js admin/operator dashboard
packages/ui      Shared design tokens and UI foundations
packages/types   Shared roles, statuses, and domain types
packages/validators Shared form and API validation schemas
packages/config  Shared app constants and route decisions
packages/database Supabase generated types and query helpers
supabase         Local Supabase config, migrations, seed data, functions
docs             Implementation notes and setup plans
```

## First Commands

Run these after the remaining CLIs are installed:

```powershell
pnpm install
supabase start
pnpm db:reset
pnpm dev:mobile
pnpm dev:admin
```

Expo Go is enough for early preview. Expo development builds should become the main testing path once native dependencies and production-like auth/device behavior matter.
