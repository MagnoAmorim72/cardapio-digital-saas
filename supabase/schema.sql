-- =========================================================================
-- CARDÁPIO DIGITAL SAAS — SCHEMA POSTGRES / SUPABASE
-- Multi-tenant por linha (row-level), isolado via Row Level Security (RLS).
-- Execute este arquivo inteiro no SQL Editor do Supabase (uma única vez).
-- =========================================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. TENANTS (empresas/clientes do SaaS)
-- -------------------------------------------------------------------------
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null,
  slug text not null unique,                -- usado no subdomínio: {slug}.seudominio.com
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  status text not null default 'active' check (status in ('active', 'suspended', 'trial')),
  logo_url text,
  banner_url text,
  description text,
  whatsapp_number text,                      -- formato E.164, ex: 5582999999999
  address text,
  instagram_url text,
  facebook_url text,
  delivery_fee numeric(10,2) not null default 0,
  min_order_value numeric(10,2) not null default 0,
  opening_hours jsonb not null default '{
    "seg": {"open": "18:00", "close": "23:00", "closed": false},
    "ter": {"open": "18:00", "close": "23:00", "closed": false},
    "qua": {"open": "18:00", "close": "23:00", "closed": false},
    "qui": {"open": "18:00", "close": "23:00", "closed": false},
    "sex": {"open": "18:00", "close": "23:30", "closed": false},
    "sab": {"open": "18:00", "close": "23:30", "closed": false},
    "dom": {"open": "18:00", "close": "23:00", "closed": false}
  }'::jsonb,
  theme jsonb not null default '{
    "primary": "255 90 31",
    "secondary": "255 197 61",
    "mode": "dark"
  }'::jsonb,                                 -- cores em "R G B" para uso direto no Tailwind
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tenants is 'Cada linha é um estabelecimento (empresa) cliente do SaaS.';
comment on column public.tenants.theme is 'Cores RGB (sem vírgula) compatíveis com CSS var + Tailwind alpha-value.';

-- -------------------------------------------------------------------------
-- 2. TENANT_USERS (usuários administradores de cada tenant)
-- -------------------------------------------------------------------------
create table if not exists public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

-- -------------------------------------------------------------------------
-- 3. CATEGORIES
-- -------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  slug text not null,
  icon text,                                 -- nome do ícone lucide-react
  display_order int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

-- -------------------------------------------------------------------------
-- 4. PRODUCTS
-- -------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  ingredients text[],                        -- lista de ingredientes
  image_url text,
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price >= 0 and promo_price <= price),
  prep_time_minutes int,
  tags text[] not null default '{}',         -- ex: {novo, promocao, mais_vendido, vegano, sem_gluten}
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sold_count int not null default 0,         -- usado para "mais vendidos"
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index if not exists idx_products_tenant on public.products (tenant_id);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_search on public.products using gin (to_tsvector('portuguese', name || ' ' || coalesce(description, '')));

-- -------------------------------------------------------------------------
-- 5. COUPONS
-- -------------------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  code text not null,
  type text not null check (type in ('percent', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  min_order_value numeric(10,2) not null default 0,
  max_uses int,                              -- null = ilimitado
  used_count int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

-- -------------------------------------------------------------------------
-- 6. ORDERS (registro dos pedidos enviados via WhatsApp)
-- -------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  customer_name text,
  customer_phone text,
  items jsonb not null,                      -- snapshot dos itens no momento do pedido
  coupon_code text,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_tenant on public.orders (tenant_id, created_at desc);

-- -------------------------------------------------------------------------
-- TRIGGERS — updated_at automático
-- -------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tenants_updated_at on public.tenants;
create trigger trg_tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR — verifica se o usuário logado administra o tenant
-- -------------------------------------------------------------------------
create or replace function public.is_tenant_admin(check_tenant_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.tenant_users
    where tenant_id = check_tenant_id
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) — isolamento de dados por cliente
-- Regra geral: leitura pública (cardápio é público), escrita restrita ao
-- admin daquele tenant.
-- =========================================================================
alter table public.tenants enable row level security;
alter table public.tenant_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;

-- TENANTS: leitura pública (para renderizar o cardápio), escrita só do admin
drop policy if exists "tenants_public_read" on public.tenants;
create policy "tenants_public_read" on public.tenants for select
  using (status = 'active');

drop policy if exists "tenants_admin_update" on public.tenants;
create policy "tenants_admin_update" on public.tenants for update
  using (public.is_tenant_admin(id));

drop policy if exists "tenants_owner_insert" on public.tenants;
create policy "tenants_owner_insert" on public.tenants for insert
  with check (owner_id = auth.uid());

-- TENANT_USERS: só o próprio usuário e admins do tenant enxergam
drop policy if exists "tenant_users_self_read" on public.tenant_users;
create policy "tenant_users_self_read" on public.tenant_users for select
  using (user_id = auth.uid() or public.is_tenant_admin(tenant_id));

-- CATEGORIES: leitura pública, escrita restrita ao admin do tenant
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select
  using (is_active = true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- PRODUCTS: leitura pública, escrita restrita ao admin do tenant
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select
  using (true);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- COUPONS: leitura pública apenas do código (validação no client), escrita admin
drop policy if exists "coupons_public_read" on public.coupons;
create policy "coupons_public_read" on public.coupons for select
  using (is_active = true);

drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- ORDERS: criação pública (cliente final registra o pedido), leitura só do admin
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders for insert
  with check (true);

drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read" on public.orders for select
  using (public.is_tenant_admin(tenant_id));

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders for update
  using (public.is_tenant_admin(tenant_id));

-- =========================================================================
-- STORAGE — buckets para logos, banners e fotos de produtos
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('tenant-assets', 'tenant-assets', true)
on conflict (id) do nothing;

drop policy if exists "tenant_assets_public_read" on storage.objects;
create policy "tenant_assets_public_read" on storage.objects for select
  using (bucket_id = 'tenant-assets');

drop policy if exists "tenant_assets_auth_write" on storage.objects;
create policy "tenant_assets_auth_write" on storage.objects for insert
  with check (bucket_id = 'tenant-assets' and auth.role() = 'authenticated');

drop policy if exists "tenant_assets_auth_update" on storage.objects;
create policy "tenant_assets_auth_update" on storage.objects for update
  using (bucket_id = 'tenant-assets' and auth.role() = 'authenticated');

drop policy if exists "tenant_assets_auth_delete" on storage.objects;
create policy "tenant_assets_auth_delete" on storage.objects for delete
  using (bucket_id = 'tenant-assets' and auth.role() = 'authenticated');

-- =========================================================================
-- SEED — dados de demonstração (opcional, remova em produção)
-- =========================================================================
insert into public.tenants (id, name, slug, whatsapp_number, address, delivery_fee, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Burger House',
  'burger-house',
  '5582999999999',
  'Av. Presidente Kennedy, 123 — Arapiraca/AL',
  6.00,
  'Hambúrgueres artesanais feitos na chapa, todo santo dia.'
)
on conflict (slug) do nothing;

insert into public.categories (tenant_id, name, slug, icon, display_order, is_featured)
values
  ('00000000-0000-0000-0000-000000000001', 'Hambúrgueres', 'hamburgueres', 'Beef', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Bebidas', 'bebidas', 'CupSoda', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Sobremesas', 'sobremesas', 'IceCreamCone', 3, false)
on conflict (tenant_id, slug) do nothing;

insert into public.products (tenant_id, category_id, name, slug, description, price, promo_price, tags, prep_time_minutes, is_featured)
select
  '00000000-0000-0000-0000-000000000001',
  c.id,
  'Cheeseburger Artesanal',
  'cheeseburger-artesanal',
  'Blend 180g, queijo cheddar, picles e molho da casa no pão brioche.',
  28.90,
  24.90,
  array['promocao', 'mais_vendido'],
  20,
  true
from public.categories c
where c.tenant_id = '00000000-0000-0000-0000-000000000001' and c.slug = 'hamburgueres'
on conflict (tenant_id, slug) do nothing;
