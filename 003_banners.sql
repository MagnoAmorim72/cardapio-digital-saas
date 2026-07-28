-- =========================================================================
-- MIGRAÇÃO: adiciona o sistema de banners promocionais (campanhas soltas,
-- sem produto vinculado, exibidas no carrossel do topo do cardápio).
-- Rode este script inteiro no SQL Editor do Supabase (uma única vez).
-- =========================================================================

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text,
  subtitle text,
  image_url text not null,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_banners_tenant on public.banners (tenant_id);

alter table public.banners enable row level security;

drop policy if exists "banners_public_read" on public.banners;
create policy "banners_public_read" on public.banners for select
  using (is_active = true);

drop policy if exists "banners_admin_all" on public.banners;
create policy "banners_admin_all" on public.banners for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));
