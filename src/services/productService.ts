import { supabase } from './supabaseClient';
import type { Product } from '@/types';

export interface ProductFilters {
  categoryId?: string | null;
  search?: string;
  onlyAvailable?: boolean;
  onlyPromo?: boolean;
  onlyBestSellers?: boolean;
}

export async function listProducts(
  tenantId: string,
  filters: ProductFilters = {}
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('tenant_id', tenantId)
    .order('display_order', { ascending: true });

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.onlyAvailable) {
    query = query.eq('is_available', true);
  }
  if (filters.onlyPromo) {
    query = query.not('promo_price', 'is', null);
  }
  if (filters.onlyBestSellers) {
    query = query.contains('tags', ['mais_vendido']);
  }
  if (filters.search && filters.search.trim().length > 0) {
    query = query.ilike('name', `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as Product[];
}

export async function getProductBySlug(
  tenantId: string,
  slug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as Product;
}

/**
 * Escolhe o melhor produto para "vitrine" do banner do cardápio, quando o
 * estabelecimento não cadastrou uma foto de banner própria. Prioridade:
 * 1) produto marcado como destaque, com foto
 * 2) produto em promoção, com foto
 * 3) qualquer produto disponível, com foto
 * Retorna null se a loja ainda não tiver nenhum produto com foto.
 */
export async function getShowcaseProduct(tenantId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('tenant_id', tenantId)
    .eq('is_available', true)
    .not('image_url', 'is', null)
    .order('display_order', { ascending: true })
    .limit(20);

  if (error) throw error;
  const products = data as unknown as Product[];
  if (products.length === 0) return null;

  const featured = products.find((p) => p.is_featured);
  if (featured) return featured;

  const onPromo = products.find((p) => p.promo_price != null);
  if (onPromo) return onPromo;

  return products[0];
}

export async function createProduct(
  payload: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sold_count' | 'category'>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleAvailability(
  id: string,
  isAvailable: boolean
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', id);
  if (error) throw error;
}
