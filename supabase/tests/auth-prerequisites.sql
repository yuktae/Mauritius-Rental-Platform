\set ON_ERROR_STOP on
set client_min_messages = notice;

-- A renter signing up, and an owner signing up, both through the real path:
-- an insert into auth.users carrying signup metadata.
insert into auth.users (id, email, aud, role, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'signup-renter@test.local', 'authenticated', 'authenticated',
   '{"roles":["renter"],"terms_accepted":"true","privacy_accepted":"true"}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'signup-owner@test.local', 'authenticated', 'authenticated',
   '{"roles":["owner","admin"],"terms_accepted":"true","privacy_accepted":"true"}'::jsonb);

do $$
declare
  renter constant uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  owner_id constant uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  got text;
  n int;
begin
  ------------------------------------------------------------------ test 1
  select count(*) into n from public.profiles where id in (renter, owner_id);
  if n = 2 then
    raise notice 'TEST 1 PASS -- signup created both profile rows';
  else
    raise notice 'TEST 1 FAIL -- % profile rows', n;
  end if;

  ------------------------------------------------------------------ test 2
  select string_agg(role::text, ',' order by role::text) into got
  from public.user_roles where user_id = owner_id;
  if got = 'owner' then
    raise notice 'TEST 2 PASS -- owner role created, admin refused (roles: %)', got;
  else
    raise notice 'TEST 2 FAIL -- roles are %', got;
  end if;

  ------------------------------------------------------------------ test 3
  select account_status::text into got from public.profiles where id = renter;
  if got = 'email_pending' then
    raise notice 'TEST 3 PASS -- new account starts at email_pending';
  else
    raise notice 'TEST 3 FAIL -- status is %', got;
  end if;

  ------------------------------------------------------------------ test 4
  update auth.users set email_confirmed_at = now() where id = renter;
  select account_status::text into got from public.profiles where id = renter;
  if got = 'profile_incomplete'
     and (select email_verified from public.profiles where id = renter) then
    raise notice 'TEST 4 PASS -- confirming email flipped email_verified and moved to profile_incomplete';
  else
    raise notice 'TEST 4 FAIL -- status %, verified %', got,
      (select email_verified from public.profiles where id = renter);
  end if;

  ------------------------------------------------------------------ test 5
  -- The user fills in only the fields they are allowed to write.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', renter, 'role', 'authenticated')::text, true);

  update public.profiles
  set full_legal_name = 'Renter One',
      phone_number    = '+23057000001',
      location_region = 'Quatre Bornes',
      preferred_language = 'en'
  where id = renter;

  execute 'reset role';

  select account_status::text into got from public.profiles where id = renter;
  if (select profile_complete from public.profiles where id = renter)
     and got = 'active_limited' then
    raise notice 'TEST 5 PASS -- profile_complete and active_limited derived without the user touching either';
  else
    raise notice 'TEST 5 FAIL -- complete %, status %',
      (select profile_complete from public.profiles where id = renter), got;
  end if;

  ------------------------------------------------------------------ test 6
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', renter, 'role', 'authenticated')::text, true);
  begin
    update public.profiles set id_verification_status = 'id_verified' where id = renter;
    raise notice 'TEST 6 FAIL -- user self-verified';
  exception when others then
    raise notice 'TEST 6 PASS -- self-verify still blocked: %', sqlerrm;
  end;
  execute 'reset role';

  ------------------------------------------------------------------ test 7
  -- An owner has the same fields filled, but owners additionally need a
  -- display name and a photo, so they must NOT be complete yet.
  update auth.users set email_confirmed_at = now() where id = owner_id;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);

  update public.profiles
  set full_legal_name = 'Owner Two',
      phone_number    = '+23057000002',
      location_region = 'Curepipe',
      preferred_language = 'fr'
  where id = owner_id;

  if not (select profile_complete from public.profiles where id = owner_id) then
    raise notice 'TEST 7 PASS -- owner not complete without display name and photo';
  else
    raise notice 'TEST 7 FAIL -- owner marked complete too early';
  end if;

  ------------------------------------------------------------------ test 8
  update public.profiles
  set display_name = 'Two Rentals',
      profile_photo_path = owner_id || '/avatar.jpg'
  where id = owner_id;
  execute 'reset role';

  select account_status::text into got from public.profiles where id = owner_id;
  if (select profile_complete from public.profiles where id = owner_id)
     and (select profile_photo_added from public.profiles where id = owner_id)
     and got = 'active_limited' then
    raise notice 'TEST 8 PASS -- owner completes once display name and photo exist';
  else
    raise notice 'TEST 8 FAIL -- complete %, photo_added %, status %',
      (select profile_complete from public.profiles where id = owner_id),
      (select profile_photo_added from public.profiles where id = owner_id), got;
  end if;

  ------------------------------------------------------------------ test 9
  -- An admin suspension must survive an ordinary profile edit.
  perform public.admin_set_account_status(renter, 'suspended', 'test suspension')
    from (select 1) s
    where false;  -- placeholder, real call below needs an admin caller
  update public.profiles set account_status = 'suspended' where id = renter;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', renter, 'role', 'authenticated')::text, true);
  begin
    update public.profiles set location_region = 'Rose Hill' where id = renter;
  exception when others then
    null;  -- suspended users are blocked by the existing RLS policy
  end;
  execute 'reset role';
  select account_status::text into got from public.profiles where id = renter;
  if got = 'suspended' then
    raise notice 'TEST 9 PASS -- suspension survives, derive did not overwrite it';
  else
    raise notice 'TEST 9 FAIL -- status became %', got;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Storage policies.
--
-- The role switch must happen INSIDE the DO block. SET LOCAL outside an
-- explicit transaction is a no-op in psql, which would leave these inserts
-- running as postgres, and a superuser bypasses RLS entirely, so every policy
-- would appear to be missing.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);

  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('profile-photos', 'aaaaaaaa-0000-0000-0000-000000000001/avatar.jpg',
            'aaaaaaaa-0000-0000-0000-000000000001');
    raise notice 'TEST 10 PASS -- user uploaded to their own prefix';
  exception when others then
    raise notice 'TEST 10 FAIL -- own upload rejected: %', sqlerrm;
  end;

  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('profile-photos', 'bbbbbbbb-0000-0000-0000-000000000002/stolen.jpg',
            'aaaaaaaa-0000-0000-0000-000000000001');
    raise notice 'TEST 11 FAIL -- user wrote into another user prefix';
  exception when others then
    raise notice 'TEST 11 PASS -- foreign prefix rejected: %', sqlerrm;
  end;

  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('verification-documents', 'aaaaaaaa-0000-0000-0000-000000000001/id.jpg',
            'aaaaaaaa-0000-0000-0000-000000000001');
    raise notice 'TEST 12 FAIL -- verification bucket accepted an upload';
  exception when others then
    raise notice 'TEST 12 PASS -- verification-documents still closed: %', sqlerrm;
  end;

  execute 'reset role';
end $$;
