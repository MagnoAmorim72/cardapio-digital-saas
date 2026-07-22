import { supabase } from './supabaseClient';
import type { Tenant } from '@/types';

/**
 * Resolve o tenant atual a partir do subdomínio (produção) ou de uma
 * variável de ambiente (desenvolvimento local).
 *
 * Produção: pizzaria-do-joao.seudominio.com -> slug "pizzaria-do-joao"
 * Local:    localhost:5173                  -> VITE_DEFAULT_TENANT_SLUG
 * Local (celular/tablet na mesma rede Wi-Fi via `vite --host`):
 *           192.168.x.x:5173                -> VITE_DEFAULT_TENANT_SLUG
 */
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export function resolveTenantSlug(): string {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || IPV4_REGEX.test(host);

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
