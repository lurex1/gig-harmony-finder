-- ============================================================
-- 1. TRIGGER: auto-create profile + subscription on user signup
--    Fires as SECURITY DEFINER so it bypasses RLS.
--    Works even when email confirmation is enabled, because
--    the trigger runs in the auth schema with elevated rights.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile (idempotent — ignore if already exists)
  insert into public.profiles (user_id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'musician')::user_role
  )
  on conflict (user_id) do nothing;

  -- Insert default subscription
  insert into public.subscriptions (user_id, plan, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'musician')::subscription_plan,
    'trial'::subscription_status
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop old trigger if exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. RLS POLICIES for profiles
--    Users can INSERT and SELECT their own row.
--    (The trigger above handles insert during signup flow,
--     but when email confirmation is OFF the client also
--     inserts directly — so we need an INSERT policy too.)
-- ============================================================

alter table public.profiles enable row level security;

-- Drop stale policies first (safe to re-run)
drop policy if exists "Users can view own profile"    on public.profiles;
drop policy if exists "Users can insert own profile"  on public.profiles;
drop policy if exists "Users can update own profile"  on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);


-- ============================================================
-- 3. RLS POLICIES for subscriptions (same pattern)
-- ============================================================

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscription"   on public.subscriptions;
drop policy if exists "Users can insert own subscription" on public.subscriptions;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);
