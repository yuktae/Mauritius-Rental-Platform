create type public.app_role as enum ('renter', 'owner', 'admin');
create type public.id_verification_status as enum (
  'not_started',
  'id_pending',
  'id_verified',
  'id_rejected',
  'id_expired',
  'manual_review'
);
create type public.account_status as enum (
  'email_pending',
  'profile_incomplete',
  'active_limited',
  'active_verified',
  'suspended',
  'deleted_requested'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_legal_name text,
  display_name text,
  phone_number text,
  phone_verified boolean not null default false,
  profile_photo_path text,
  profile_photo_added boolean not null default false,
  location_region text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'fr', 'mfe')),
  date_of_birth date,
  email_verified boolean not null default false,
  profile_complete boolean not null default false,
  id_verification_status public.id_verification_status not null default 'not_started',
  account_status public.account_status not null default 'email_pending',
  last_used_role public.app_role,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  calendar_connected boolean not null default false,
  payout_ready boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_last_used_role_not_admin check (last_used_role is null or last_used_role in ('renter', 'owner'))
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.verification_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.id_verification_status not null default 'not_started',
  provider text,
  provider_reference text,
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.category_fields (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  key text not null,
  label text not null,
  field_type text not null,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, key)
);

create table public.category_rules (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  rule_key text not null,
  rule_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (category_id, rule_key)
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id),
  target_user_id uuid references public.profiles(id),
  action text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_verification_checks_updated_at
before update on public.verification_checks
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create or replace function public.has_role(check_user_id uuid, check_role public.app_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user_id
      and role = check_role
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.verification_checks enable row level security;
alter table public.categories enable row level security;
alter table public.category_fields enable row level security;
alter table public.category_rules enable row level security;
alter table public.admin_actions enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Admins can read all profiles"
on public.profiles for select
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can insert their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update basic fields on their own profile"
on public.profiles for update
using (id = auth.uid())
with check (
  id = auth.uid()
  and account_status <> 'suspended'
);

create policy "Users can read their own roles"
on public.user_roles for select
using (user_id = auth.uid());

create policy "Admins can read all roles"
on public.user_roles for select
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can add non-admin signup roles to themselves"
on public.user_roles for insert
with check (
  user_id = auth.uid()
  and role in ('renter', 'owner')
);

create policy "Users can read their own verification checks"
on public.verification_checks for select
using (user_id = auth.uid());

create policy "Admins can manage verification checks"
on public.verification_checks for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Users can create their own verification check"
on public.verification_checks for insert
with check (user_id = auth.uid());

create policy "Active categories are public"
on public.categories for select
using (is_active = true);

create policy "Active category fields are public"
on public.category_fields for select
using (
  exists (
    select 1
    from public.categories
    where categories.id = category_fields.category_id
      and categories.is_active = true
  )
);

create policy "Active category rules are public"
on public.category_rules for select
using (
  exists (
    select 1
    from public.categories
    where categories.id = category_rules.category_id
      and categories.is_active = true
  )
);

create policy "Admins manage categories"
on public.categories for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage category fields"
on public.category_fields for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage category rules"
on public.category_rules for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins read admin actions"
on public.admin_actions for select
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins create admin actions"
on public.admin_actions for insert
with check (
  public.has_role(auth.uid(), 'admin')
  and admin_user_id = auth.uid()
);

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('profile-photos', 'profile-photos', true, 5242880),
  ('listing-images', 'listing-images', true, 10485760),
  ('verification-documents', 'verification-documents', false, 10485760),
  ('listing-documents', 'listing-documents', false, 10485760),
  ('dispute-evidence', 'dispute-evidence', false, 10485760)
on conflict (id) do nothing;
