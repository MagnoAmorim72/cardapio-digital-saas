import { supabase } from './supabaseClient';
import type { Coupon } from '@/types';

export async function listCoupons(tenantId: string): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Coupon[];
}

export async function createCoupon(
  payload: Omit<Coupon, 'id' | 'created_at' | 'used_count'>
): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Coupon;
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  coupon?: Coupon;
}

/** Validação client-side (a garantia final de integridade fica nas policies/RLS + lógica de checkout futura). */
export async function validateCoupon(
  tenantId: string,
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, reason: 'Cupom não encontrado ou inativo.' };
  }

  const coupon = data as Coupon;

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, reason: 'Cupom expirado.' };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, reason: 'Cupom esgotado.' };
  }
  if (subtotal < coupon.min_order_value) {
    return {
      valid: false,
      reason: `Pedido mínimo de ${coupon.min_order_value.toFixed(2)} para usar este cupom.`,
    };
  }

  return { valid: true, coupon };
}
