-- Makes table privileges identical on local, preprod and production.
--
-- The local Supabase CLI stack and the hosted platform ship DIFFERENT default
-- privileges for objects created by the postgres role. Locally, anon and
-- authenticated get only Dxt (no SELECT/INSERT/UPDATE/DELETE), which is why
-- 202608180000 had to grant access explicitly. On the hosted projects the
-- older permissive defaults still apply, so anon and authenticated were handed
-- table-wide privileges automatically.
--
-- Confirmed against boro-preprod over the REST API: an anonymous request to
-- /rest/v1/profiles returned 200 [] rather than "permission denied", meaning
-- anon held a SELECT grant it never holds locally.
--
-- No data was exposed, because RLS returns nothing to an anonymous caller and
-- the column-level UPDATE restriction from 202608180001 applied remotely as
-- written. The problem is drift: local was stricter than production, so local
-- testing could not predict production behaviour.
--
-- This migration resets both client roles to zero and re-grants exactly the
-- intended set, so the end state no longer depends on which defaults the
-- platform happened to apply.
--
-- NOTE for future migrations: any new table in the public schema must grant
-- its own access. Client roles are deny-by-default here on purpose.

revoke all on all tables in schema public from anon, authenticated;

-- --------------------------------------------------------------- public read
-- Category data is browsable by signed-out visitors.
grant select on public.categories to anon, authenticated;
grant select on public.category_fields to anon, authenticated;
grant select on public.category_rules to anon, authenticated;

-- ------------------------------------------------------------ signed-in only
grant select, insert on public.profiles to authenticated;
grant select, insert on public.user_roles to authenticated;
grant select, insert, update, delete on public.verification_checks to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.category_fields to authenticated;
grant insert, update, delete on public.category_rules to authenticated;
grant select, insert on public.admin_actions to authenticated;

-- ------------------------------------------- profiles: per-column self-update
-- Re-applied because the blanket revoke above cleared the column grants from
-- 202608180001. Protected columns stay out of reach; the guard trigger and the
-- admin SECURITY DEFINER functions from that migration are unaffected.
grant update (
  full_legal_name,
  display_name,
  phone_number,
  profile_photo_path,
  location_region,
  preferred_language,
  date_of_birth,
  last_used_role,
  terms_accepted_at,
  privacy_accepted_at
) on public.profiles to authenticated;

-- ------------------------------------------------------------- trusted server
grant all on all tables in schema public to service_role;
