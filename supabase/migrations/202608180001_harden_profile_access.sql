-- Hardens profile access before BORO reaches a hosted database.
--
-- Two problems in 202608170001_initial_phase1_access.sql:
--
-- 1. The self-update policy on public.profiles only blocked suspended
--    accounts. RLS cannot restrict which COLUMNS an update touches, so any
--    authenticated user could set their own id_verification_status to
--    'id_verified' and account_status to 'active_verified'. The anon key ships
--    to every browser, so this was reachable by anyone who signed up.
--
-- 2. Admins could read profiles but had no UPDATE path, so the operator
--    dashboard could not approve verifications or suspend accounts.
--
-- Fix: column-level UPDATE grants so self-service can only touch profile
-- fields, a guard trigger as defence in depth, and SECURITY DEFINER functions
-- that give admins the privileged transitions while writing an audit row.

-- ---------------------------------------------------------------------------
-- 1. Restrict which columns a user may update on their own row
-- ---------------------------------------------------------------------------

revoke update on public.profiles from authenticated;

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

-- ---------------------------------------------------------------------------
-- 2. Defence in depth: reject protected column changes from normal callers
-- ---------------------------------------------------------------------------

create or replace function public.guard_protected_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Server-side callers (service role) and the SECURITY DEFINER admin
  -- functions below run as a privileged role and are allowed through.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or new.email_verified is distinct from old.email_verified
    or new.phone_verified is distinct from old.phone_verified
    or new.profile_complete is distinct from old.profile_complete
    or new.profile_photo_added is distinct from old.profile_photo_added
    or new.id_verification_status is distinct from old.id_verification_status
    or new.account_status is distinct from old.account_status
    or new.calendar_connected is distinct from old.calendar_connected
    or new.payout_ready is distinct from old.payout_ready
    or new.created_at is distinct from old.created_at
  then
    raise exception
      'Protected profile columns cannot be changed directly. Use the admin functions or a server-side call.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger guard_profiles_protected_columns
before update on public.profiles
for each row execute function public.guard_protected_profile_columns();

-- ---------------------------------------------------------------------------
-- 3. Admin transitions, each one audited into public.admin_actions
-- ---------------------------------------------------------------------------

create or replace function public.admin_set_id_verification_status(
  target_user_id uuid,
  new_status public.id_verification_status,
  reason text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_admin uuid := auth.uid();
  updated_profile public.profiles;
begin
  if not public.has_role(acting_admin, 'admin') then
    raise exception 'Only an admin may change verification status'
      using errcode = '42501';
  end if;

  if new_status = 'id_rejected' and (reason is null or btrim(reason) = '') then
    raise exception 'A rejection reason is required when rejecting an ID'
      using errcode = '22023';
  end if;

  update public.profiles
  set id_verification_status = new_status
  where id = target_user_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile % not found', target_user_id
      using errcode = 'P0002';
  end if;

  update public.verification_checks
  set status = new_status,
      rejection_reason = case when new_status = 'id_rejected' then reason else null end,
      reviewed_by = acting_admin,
      reviewed_at = now()
  where user_id = target_user_id;

  insert into public.admin_actions (admin_user_id, target_user_id, action, reason, metadata)
  values (
    acting_admin,
    target_user_id,
    'set_id_verification_status',
    reason,
    jsonb_build_object('new_status', new_status)
  );

  return updated_profile;
end;
$$;

create or replace function public.admin_set_account_status(
  target_user_id uuid,
  new_status public.account_status,
  reason text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_admin uuid := auth.uid();
  updated_profile public.profiles;
begin
  if not public.has_role(acting_admin, 'admin') then
    raise exception 'Only an admin may change account status'
      using errcode = '42501';
  end if;

  if target_user_id = acting_admin then
    raise exception 'An admin cannot change their own account status'
      using errcode = '42501';
  end if;

  if new_status = 'suspended' and (reason is null or btrim(reason) = '') then
    raise exception 'A reason is required when suspending an account'
      using errcode = '22023';
  end if;

  update public.profiles
  set account_status = new_status
  where id = target_user_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile % not found', target_user_id
      using errcode = 'P0002';
  end if;

  insert into public.admin_actions (admin_user_id, target_user_id, action, reason, metadata)
  values (
    acting_admin,
    target_user_id,
    'set_account_status',
    reason,
    jsonb_build_object('new_status', new_status)
  );

  return updated_profile;
end;
$$;

revoke all on function public.admin_set_id_verification_status(uuid, public.id_verification_status, text) from public, anon;
revoke all on function public.admin_set_account_status(uuid, public.account_status, text) from public, anon;

grant execute on function public.admin_set_id_verification_status(uuid, public.id_verification_status, text) to authenticated;
grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;
