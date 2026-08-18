-- Grants the base table privileges that RLS filters on top of.
--
-- Supabase's default privileges for objects created by the `postgres` role
-- (which is the role migrations run as) are:
--
--   anon=Dxt  authenticated=Dxt  service_role=Dxt
--
-- Dxt is TRUNCATE, REFERENCES and TRIGGER. There is no SELECT, INSERT, UPDATE
-- or DELETE. Row Level Security filters privileges a role already holds; it
-- cannot grant them. So every table created in
-- 202608170001_initial_phase1_access.sql is unreachable from the anon and
-- authenticated roles, and every policy in that migration is inert.
--
-- Nothing surfaced this yet because no application code queries the database.
-- The first Supabase call from apps/web would have failed with
-- "permission denied for table ...".
--
-- Each grant below matches the intent of an existing policy. RLS still decides
-- which rows are visible or writable; these grants only open the door.

-- ---------------------------------------------------------------------------
-- profiles: read and create own row.
-- UPDATE is deliberately omitted here and granted per column in
-- 202608180001_harden_profile_access.sql.
-- ---------------------------------------------------------------------------
grant select, insert on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- user_roles: read own roles, add own non-admin roles at signup.
-- No UPDATE or DELETE: role removal is an admin/server operation.
-- ---------------------------------------------------------------------------
grant select, insert on public.user_roles to authenticated;

-- ---------------------------------------------------------------------------
-- verification_checks: users read and create their own.
-- UPDATE and DELETE are reachable only through the "Admins can manage
-- verification checks" policy, which requires has_role(auth.uid(), 'admin').
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.verification_checks to authenticated;

-- ---------------------------------------------------------------------------
-- categories and their children: public browse for signed-out visitors,
-- writes gated to admins by the "Admins manage ..." policies.
-- ---------------------------------------------------------------------------
grant select on public.categories to anon, authenticated;
grant select on public.category_fields to anon, authenticated;
grant select on public.category_rules to anon, authenticated;

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.category_fields to authenticated;
grant insert, update, delete on public.category_rules to authenticated;

-- ---------------------------------------------------------------------------
-- admin_actions: the audit trail. Admin-only by policy.
-- No UPDATE or DELETE by design, so audit rows cannot be rewritten.
-- ---------------------------------------------------------------------------
grant select, insert on public.admin_actions to authenticated;

-- ---------------------------------------------------------------------------
-- service_role is the trusted server-side key used by apps/admin. It bypasses
-- RLS but still needs table privileges, and it has none by default either.
-- The default privilege change keeps future migrations from reintroducing this
-- same gap for the server role. Client roles stay deny-by-default on purpose:
-- every new table must grant them access explicitly.
-- ---------------------------------------------------------------------------
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
