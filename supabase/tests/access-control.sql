\set ON_ERROR_STOP on
set client_min_messages = notice;

insert into auth.users (id, email, aud, role) values
  ('11111111-1111-1111-1111-111111111111','renter@test.local','authenticated','authenticated'),
  ('22222222-2222-2222-2222-222222222222','admin@test.local','authenticated','authenticated');

-- profiles rows are now created by the handle_new_user trigger, so this
-- suite no longer inserts them. Email is confirmed so the profiles are past
-- email_pending and ordinary updates are allowed.
update auth.users set email_confirmed_at = now()
where id in ('11111111-1111-1111-1111-111111111111',
             '22222222-2222-2222-2222-222222222222');

insert into public.user_roles (user_id, role) values
  ('11111111-1111-1111-1111-111111111111','renter'),
  ('22222222-2222-2222-2222-222222222222','admin');

do $$
declare
  renter constant text := '11111111-1111-1111-1111-111111111111';
  admin  constant text := '22222222-2222-2222-2222-222222222222';
  got text;
begin
  ---------------------------------------------------------------- test 1
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', renter, 'role','authenticated')::text, true);
  begin
    update public.profiles set id_verification_status = 'id_verified' where id = renter::uuid;
    raise notice 'TEST 1 FAIL -- renter self-verified';
  exception when others then
    raise notice 'TEST 1 PASS -- self-verify blocked: %', sqlerrm;
  end;

  ---------------------------------------------------------------- test 2
  begin
    update public.profiles set account_status = 'active_verified' where id = renter::uuid;
    raise notice 'TEST 2 FAIL -- renter self-activated';
  exception when others then
    raise notice 'TEST 2 PASS -- self-activate blocked: %', sqlerrm;
  end;

  ---------------------------------------------------------------- test 3
  begin
    update public.profiles set display_name = 'Renter One' where id = renter::uuid;
    select display_name into got from public.profiles where id = renter::uuid;
    if got = 'Renter One' then
      raise notice 'TEST 3 PASS -- renter edited own display_name';
    else
      raise notice 'TEST 3 FAIL -- display_name not written';
    end if;
  exception when others then
    raise notice 'TEST 3 FAIL -- legit edit blocked: %', sqlerrm;
  end;

  ---------------------------------------------------------------- test 4
  begin
    perform public.admin_set_id_verification_status(renter::uuid, 'id_verified', 'self serve');
    raise notice 'TEST 4 FAIL -- non-admin called admin function';
  exception when others then
    raise notice 'TEST 4 PASS -- non-admin rejected: %', sqlerrm;
  end;

  ---------------------------------------------------------------- test 5
  perform set_config('request.jwt.claims', json_build_object('sub', admin, 'role','authenticated')::text, true);
  begin
    perform public.admin_set_id_verification_status(renter::uuid, 'id_verified', 'documents ok');
    select id_verification_status::text into got from public.profiles where id = renter::uuid;
    if got = 'id_verified' then
      raise notice 'TEST 5 PASS -- admin verified renter (status now %)', got;
    else
      raise notice 'TEST 5 FAIL -- status is %', got;
    end if;
  exception when others then
    raise notice 'TEST 5 FAIL -- admin call errored: %', sqlerrm;
  end;

  ---------------------------------------------------------------- test 6
  begin
    perform public.admin_set_account_status(renter::uuid, 'suspended', null);
    raise notice 'TEST 6 FAIL -- suspended with no reason';
  exception when others then
    raise notice 'TEST 6 PASS -- reason required: %', sqlerrm;
  end;

  ---------------------------------------------------------------- test 7
  select count(*)::text into got from public.admin_actions where admin_user_id = admin::uuid;
  if got = '1' then
    raise notice 'TEST 7 PASS -- 1 audit row written';
  else
    raise notice 'TEST 7 FAIL -- % audit rows', got;
  end if;

  execute 'reset role';
end $$;
