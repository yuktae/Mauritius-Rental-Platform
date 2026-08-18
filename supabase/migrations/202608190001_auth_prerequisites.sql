-- Makes signup and onboarding possible.
--
-- Before this migration the access flow could not run at all:
--
--   1. Nothing created a public.profiles row when a user signed up, so every
--      read after signup returned nothing.
--   2. profile_complete, profile_photo_added, email_verified and
--      account_status were locked against self-service writes by
--      202608180001. That protection is correct, it is what stops a user
--      marking themselves id_verified, but nothing was left that could set
--      them, so onboarding could never finish.
--   3. The five storage buckets from 202608170001 were created with no
--      storage.objects policies, so every upload and read was denied.
--
-- The fix is to let the database derive its own state. Users supply facts
-- about themselves; the system decides what those facts mean.

-- ---------------------------------------------------------------------------
-- 1. Derive profile state
-- ---------------------------------------------------------------------------
-- Runs on every insert and update and recomputes the flags the user is not
-- allowed to write. Because these are assignments to NEW in a BEFORE trigger,
-- the values are whatever this function decides regardless of what the caller
-- submitted.

create or replace function public.derive_profile_state()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.profile_photo_added := new.profile_photo_path is not null;

  new.profile_complete :=
    coalesce(new.email_verified, false)
    and coalesce(btrim(new.full_legal_name), '') <> ''
    and coalesce(btrim(new.phone_number), '') <> ''
    and coalesce(btrim(new.location_region), '') <> ''
    and new.preferred_language is not null;

  -- Owners carry two extra requirements from the Phase 1 profile table:
  -- a display name and a profile picture, both of which exist to build trust
  -- with the renter who is about to hand over a deposit.
  if new.profile_complete and public.has_role(new.id, 'owner') then
    new.profile_complete :=
      coalesce(btrim(new.display_name), '') <> ''
      and new.profile_photo_added;
  end if;

  -- The account ladder is derived, but only inside the self-service range.
  -- suspended and deleted_requested are admin decisions and must survive an
  -- ordinary profile edit, so they are deliberately left untouched here.
  if new.account_status in (
    'email_pending', 'profile_incomplete', 'active_limited', 'active_verified'
  ) then
    if not coalesce(new.email_verified, false) then
      new.account_status := 'email_pending';
    elsif not new.profile_complete then
      new.account_status := 'profile_incomplete';
    elsif new.id_verification_status = 'id_verified' then
      new.account_status := 'active_verified';
    else
      new.account_status := 'active_limited';
    end if;
  end if;

  return new;
end;
$$;

-- Trigger order matters and Postgres fires BEFORE triggers in alphabetical
-- order by name. The guard from 202608180001 is named
-- guard_profiles_protected_columns, and this one is deliberately named to sort
-- after it, so the sequence on an update is:
--
--   guard  -> did the CALLER try to change a protected column? reject if so
--   derive -> now recompute those columns from the facts
--
-- Reversing this would make the guard see the derived values as a caller's
-- edit and reject every legitimate profile update.
create trigger zz_derive_profiles_state
before insert or update on public.profiles
for each row execute function public.derive_profile_state();

-- ---------------------------------------------------------------------------
-- 2. Create the profile when an auth user is created
-- ---------------------------------------------------------------------------
-- Role intent is read from the signup metadata. Only renter and owner are
-- honoured: admin is never self-assignable, matching the RLS policy on
-- user_roles and the locked product decision that admin accounts are created
-- by invitation.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_name text;
begin
  insert into public.profiles (
    id,
    email,
    email_verified,
    terms_accepted_at,
    privacy_accepted_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    new.email_confirmed_at is not null,
    case
      when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now()
    end,
    case
      when (new.raw_user_meta_data ->> 'privacy_accepted') = 'true' then now()
    end
  )
  on conflict (id) do nothing;

  if jsonb_typeof(new.raw_user_meta_data -> 'roles') = 'array' then
    for role_name in
      select jsonb_array_elements_text(new.raw_user_meta_data -> 'roles')
    loop
      if role_name in ('renter', 'owner') then
        insert into public.user_roles (user_id, role)
        values (new.id, role_name::public.app_role)
        on conflict do nothing;
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Mirror email confirmation onto the profile
-- ---------------------------------------------------------------------------
-- Supabase records email confirmation on auth.users. Without this the OTP
-- screen would succeed while the profile still reported email_verified false,
-- leaving the user redirected back to OTP forever.

create or replace function public.sync_profile_email_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at
    or new.email is distinct from old.email
  then
    update public.profiles
    set
      email_verified = new.email_confirmed_at is not null,
      email = coalesce(new.email, email)
    where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_email_changed
after update on auth.users
for each row execute function public.sync_profile_email_state();

-- ---------------------------------------------------------------------------
-- 4. Storage policies for profile photos
-- ---------------------------------------------------------------------------
-- Path convention is <user_id>/<filename>, so the first path segment is the
-- ownership check. The bucket is public, so reads are open; writes are not.
--
-- The other four buckets stay closed until the features that use them are
-- built. verification-documents in particular must not open before the Data
-- Protection Office registration is complete.

create policy "Profile photos are publicly readable"
on storage.objects for select
using (bucket_id = 'profile-photos');

create policy "Users upload their own profile photo"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users replace their own profile photo"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete their own profile photo"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
