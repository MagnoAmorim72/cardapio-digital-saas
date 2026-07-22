import { supabase } from './supabaseClient';
import type { Tenant } from '@/types';

/**
 * Resolve o tenant atual a partir do subdomínio (produção com domínio
 * próprio) ou de uma variável de ambiente (ambientes de demonstração/local).
 *
 * Produção (domínio próprio): pizzaria-do-joao.seudominio.com -> slug "pizzaria-do-joao"
 * Local:                      localhost:5173 / 192.168.x.x    -> VITE_DEFAULT_TENANT_SLUG
 * Demo gratuita (Vercel/Cloudflare Pages): o nome do projeto (ex: "burger-house.vercel.app")
 * não é garantido — esses domínios são compartilhados globalmente entre todos os usuários
 * da plataforma, então o nome desejado pode já estar em uso por terceiros. Por isso, enquanto
 * não houver um domínio próprio configurado, qualquer link nesses domínios também usa o slug
 * padrão do .env, assim como localhost.
 */
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const DEMO_HOSTING_SUFFIXES = ['.vercel.app', '.pages.dev'];

export function resolveTenantSlug(): string {
  const host = window.location.hostname;
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    IPV4_REGEX.test(host) ||
    DEMO_HOSTING_SUFFIXES.some((suffix) => host.endsWith(suffix));

  if (isLocal) {
    return import.meta.env.VITE_DEFAULT_TENANT_SLUG || 'burger-house';
  }

  const parts = host.split('.');
  // suporta "slug.dominio.com" e "slug.dominio.com.br"
  return parts.length > 2 ? parts[0] : host;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // nenhuma linha encontrada
    throw error;
  }

  return data as Tenant;
}

export async function updateTenant(
  tenantId: string,
  patch: Partial<Tenant>
): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .update(patch)
    .eq('id', tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as Tenant;
}

/** Retorna o(s) tenant(is) administrados pelo usuário autenticado. */
export async function getTenantsForCurrentUser(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('tenant_users')
    .select('tenant:tenants(*)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => row.tenant) as unknown as Tenant[];
}
