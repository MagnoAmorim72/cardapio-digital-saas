import { supabase } from './supabaseClient';
import type { CartItem, TenantPaymentSettings } from '@/types';

export interface CreateCardPaymentParams {
  tenantId: string;
  items: CartItem[];
  customerName: string;
  couponCode: string | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
}

export interface CreateCardPaymentResult {
  checkoutUrl: string;
  orderId: string;
}

/**
 * Chama a Edge Function que cria o pedido e a preferência de pagamento no
 * Mercado Pago, devolvendo o link para onde o cliente deve ser redirecionado
 * para pagar com cartão.
 */
export async function createCardPayment(
  params: CreateCardPaymentParams
): Promise<CreateCardPaymentResult> {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: {
      tenant_id: params.tenantId,
      items: params.items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.promo_price ?? i.product.price,
        notes: i.notes || undefined,
      })),
      customer_name: params.customerName || null,
      coupon_code: params.couponCode,
      subtotal: params.subtotal,
      discount: params.discount,
      delivery_fee: params.deliveryFee,
      total: params.total,
      notes: params.notes,
      return_url_base: window.location.origin,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return { checkoutUrl: data.checkout_url, orderId: data.order_id };
}

// ---------------------------------------------------------------------
// Configuração das credenciais do Mercado Pago (painel admin)
// ---------------------------------------------------------------------

export async function getPaymentSettings(tenantId: string): Promise<TenantPaymentSettings | null> {
  const { data, error } = await supabase
    .from('tenant_payment_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) throw error;
  return data as TenantPaymentSettings | null;
}

export async function savePaymentSettings(
  tenantId: string,
  patch: { mp_access_token: string; mp_public_key: string; is_test_mode: boolean }
): Promise<void> {
  const { error } = await supabase
    .from('tenant_payment_settings')
    .upsert({ tenant_id: tenantId, ...patch });
  if (error) throw error;
}
