-- Muxima Bet — schema completo (profiles, deposits, pixel_attribution)
-- Migração para o Supabase próprio da Muxima Bet.

-- ===== PROFILES =====
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text,
  phone text,
  nif text,
  balance numeric not null default 0,
  total_deposited numeric not null default 0,
  total_withdrawn numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

create index if not exists profiles_phone_idx on public.profiles (phone);

-- Cria o perfil automaticamente quando uma conta é registada
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, phone, nif)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'Jogador'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'nif'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== DEPOSITS =====
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  payment_method text,
  status text not null default 'pending',
  external_id text unique,
  created_at timestamptz not null default now()
);

alter table public.deposits enable row level security;

create policy "deposits_select_own" on public.deposits
  for select using (auth.uid() = user_id);
create policy "deposits_insert_own" on public.deposits
  for insert with check (auth.uid() = user_id);

-- ===== PIXEL ATTRIBUTION =====
create table if not exists public.pixel_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  fbp text,
  fbc text,
  last_event_id text,
  user_agent text,
  email text,
  updated_at timestamptz not null default now()
);

alter table public.pixel_attribution enable row level security;

create policy "pixel_select_own" on public.pixel_attribution
  for select using (auth.uid() = user_id);
create policy "pixel_insert_own" on public.pixel_attribution
  for insert with check (auth.uid() = user_id);
create policy "pixel_update_own" on public.pixel_attribution
  for update using (auth.uid() = user_id);

-- ===== CRÉDITO DE DEPÓSITO (usado pelo webhook, idempotente) =====
create or replace function public.credit_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_bonus numeric,
  p_external_id text,
  p_method text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance numeric;
  v_bonus numeric;
begin
  -- autoriza a alteração de saldo (contexto de servidor; ver guard_profile_money)
  perform set_config('app.balance_ok', 'on', true);

  -- Bónus definido pelo VALOR do depósito (fonte de verdade no servidor).
  -- O valor de bónus enviado pela Kintu é ignorado para os pacotes conhecidos,
  -- por isso não é preciso reconfigurar o &bonus= na Kintu.
  v_bonus := case
    when p_amount = 3000  then 0
    when p_amount = 5000  then 2500
    when p_amount = 10000 then 7500
    when p_amount = 15000 then 15000
    else coalesce(p_bonus, 0)
  end;

  -- idempotência: se este pagamento já foi processado, não credita duas vezes
  if p_external_id is not null
     and exists (select 1 from public.deposits where external_id = p_external_id) then
    return jsonb_build_object('status', 'duplicate', 'external_id', p_external_id);
  end if;

  insert into public.deposits (user_id, amount, payment_method, status, external_id)
  values (p_user_id, p_amount + v_bonus, p_method, 'completed', p_external_id);

  update public.profiles
     set balance = balance + p_amount + v_bonus,
         total_deposited = total_deposited + p_amount,
         updated_at = now()
   where user_id = p_user_id
  returning balance into v_new_balance;

  return jsonb_build_object('status', 'credited', 'new_balance', v_new_balance, 'bonus', v_bonus);
end;
$$;
