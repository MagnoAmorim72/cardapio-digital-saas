-- =========================================================================
-- MIGRAÇÃO: adiciona suporte a pagamento com cartão via Mercado Pago.
-- Rode este script inteiro no SQL Editor do Supabase (uma única vez).
-- =========================================================================

-- 1) Flag pública no tenant (sem segredo nenhum, só indica se o pagamento
--    com cartão está habilitado para exibir o botão no cardápio).
alter table public.tenants
  add column if not exists card_payment_enabled boolean not null default false;

-- 2) Tabela protegida para as credenciais do Mercado Pago de cada tenant.
create table if not exists public.tenant_payment_settings (
  tenant_id uuid primary key references public.tenants (id) on delete cascade,
  mp_access_token text,
  mp_public_key text,
  is_test_mode boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payment_settings_updated_at on public.tenant_payment_settings;
create trigger trg_payment_settings_updated_at before update on public.tenant_payment_settings
  for each row execute function public.set_updated_at();

alter table public.tenant_payment_settings enable row level security;

drop policy if exists "payment_settings_admin_all" on public.tenant_payment_settings;
create policy "payment_settings_admin_all" on public.tenant_payment_settings for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- 3) Novas colunas de rastreamento de pagamento na tabela de pedidos.
alter table public.orders
  add column if not exists payment_method text not null default 'whatsapp'
    check (payment_method in ('whatsapp', 'pix', 'card'));
alter table public.orders
  add column if not exists payment_status text not null default 'not_applicable'
    check (payment_status in ('not_applicable', 'pending', 'approved', 'rejected'));
alter table public.orders add column if not exists mp_preference_id text;
alter table public.orders add column if not exists mp_payment_id text;

-- 4) Reforça a política de criação de pedidos: pedidos com cartão só podem
--    ser criados pela Edge Function segura (service role), nunca direto
--    pelo cliente — impede forjar um pagamento "aprovado" sem pagar.
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders for insert
  with check (
    payment_method in ('whatsapp', 'pix')
    and payment_status = 'not_applicable'
  );
