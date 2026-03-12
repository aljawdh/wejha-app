-- ============================================================
-- وِجهة — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── Enable UUID extension ─────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Merchants ─────────────────────────────────────────────
create table public.merchants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner_name    text,
  phone         text unique not null,
  email         text unique not null,
  city          text default 'الدوحة',
  category      text,
  description   text,
  address       text,
  iban          text,
  bank          text,
  cr_number     text,
  cr_expiry     date,
  license_number text,
  logo_url      text,
  cover_url     text,
  lat           numeric,
  lng           numeric,
  radius_m      int default 500,
  status        text default 'pending' check (status in ('pending','active','suspended','rejected')),
  wejha_pct     numeric default 0.10,
  balance       numeric default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Deals (Coupons) ───────────────────────────────────────
create table public.deals (
  id             uuid primary key default gen_random_uuid(),
  merchant_id    uuid references public.merchants(id) on delete cascade,
  title          text not null,
  description    text,
  type           text default 'product' check (type in ('product','invoice_paid','bogo')),
  disc           int default 0,
  original_price numeric default 0,
  min_spend      numeric default 0,
  max_codes      int default 50,
  used           int default 0,
  bogo           boolean default false,
  active         boolean default true,
  expires_hours  int,
  start_time     text default '08:00',
  end_time       text default '22:00',
  img_url        text,
  saved_value    numeric default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── Claimed Coupons ───────────────────────────────────────
create table public.claimed_coupons (
  id           uuid primary key default gen_random_uuid(),
  deal_id      uuid references public.deals(id) on delete cascade,
  merchant_id  uuid references public.merchants(id),
  user_phone   text not null,
  code         text unique not null,
  qty          int default 1,
  qty_summary  text,
  price_paid   numeric default 0,
  ends_at      timestamptz,
  used_at      timestamptz,
  created_at   timestamptz default now()
);

-- ─── Admin Users ───────────────────────────────────────────
create table public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  name       text not null,
  role       text default 'support' check (role in ('admin','merchant_manager','finance','accounting','support','content')),
  active     boolean default true,
  created_at timestamptz default now()
);

-- ─── Merchant Payouts ──────────────────────────────────────
create table public.payouts (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid references public.merchants(id),
  amount        numeric not null,
  fee           numeric default 0,
  net_amount    numeric not null,
  method        text default 'iban',
  status        text default 'pending' check (status in ('pending','processing','completed','failed')),
  reference     text,
  requested_at  timestamptz default now(),
  processed_at  timestamptz
);

-- ─── Complaints / Reports ──────────────────────────────────
create table public.complaints (
  id          uuid primary key default gen_random_uuid(),
  user_phone  text,
  merchant_id uuid references public.merchants(id),
  deal_id     uuid references public.deals(id),
  type        text,
  description text,
  status      text default 'open',
  created_at  timestamptz default now()
);

-- ─── RLS Policies ──────────────────────────────────────────
alter table public.merchants enable row level security;
alter table public.deals enable row level security;
alter table public.claimed_coupons enable row level security;

-- Merchants: can only read/update their own record
create policy "merchant_own" on public.merchants
  for all using (auth.uid()::text = id::text);

-- Deals: public read, merchant can manage own deals
create policy "deals_public_read" on public.deals
  for select using (active = true);

create policy "deals_merchant_manage" on public.deals
  for all using (
    merchant_id in (
      select id from public.merchants where id::text = auth.uid()::text
    )
  );

-- Claimed coupons: user sees own, merchant sees theirs
create policy "claimed_own_user" on public.claimed_coupons
  for all using (user_phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- ─── Functions ─────────────────────────────────────────────

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger merchants_updated_at before update on public.merchants
  for each row execute function update_updated_at();

create trigger deals_updated_at before update on public.deals
  for each row execute function update_updated_at();

-- Increment deal used count when coupon is claimed
create or replace function increment_deal_used()
returns trigger as $$
begin
  update public.deals set used = used + new.qty where id = new.deal_id;
  return new;
end;
$$ language plpgsql;

create trigger on_coupon_claimed after insert on public.claimed_coupons
  for each row execute function increment_deal_used();

-- Calculate merchant balance after coupon used
create or replace function update_merchant_balance()
returns trigger as $$
declare
  v_deal public.deals%rowtype;
  v_price_after_disc numeric;
  v_wejha_fee numeric;
  v_merchant_share numeric;
begin
  -- Only trigger when coupon is marked as used
  if new.used_at is not null and old.used_at is null then
    select * into v_deal from public.deals where id = new.deal_id;
    
    if v_deal.bogo then
      v_price_after_disc := v_deal.original_price / 2;
    else
      v_price_after_disc := v_deal.original_price * (1 - v_deal.disc::numeric / 100);
    end if;
    
    v_wejha_fee := v_price_after_disc * 0.10;
    v_merchant_share := v_price_after_disc * 0.90;
    
    update public.merchants
      set balance = balance + v_merchant_share
      where id = new.merchant_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_coupon_used after update on public.claimed_coupons
  for each row execute function update_merchant_balance();

-- ─── Seed: Default Admin ───────────────────────────────────
insert into public.admin_users (email, name, role) values
  ('admin@wejha.qa', 'مشرف وِجهة', 'admin'),
  ('finance@wejha.qa', 'المشرف المالي', 'finance'),
  ('accounting@wejha.qa', 'المحاسب', 'accounting');
