import { supabase } from './supabaseClient';
import type { Banner } from '@/types';

/** Banners ativos do cardápio público, na ordem configurada pelo admin. */
export async function listActiveBanners(tenantId: string): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Banner[];
}

/** Inclui banners inativos — usado apenas no painel admin. */
export async function listBannersAdmin(tenantId: string): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Banner[];
}

export async function createBanner(
  payload: Omit<Banner, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('banners').insert(payload);
  if (error) throw error;
}

export async function updateBanner(id: string, patch: Partial<Banner>): Promise<void> {
  const { error } = await supabase.from('banners').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}
