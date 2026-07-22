import type { CartItem, Tenant, AppliedCoupon } from '@/types';
import { formatCurrency } from './formatCurrency';

interface BuildOrderMessageParams {
  tenant: Tenant;
  items: CartItem[];
  coupon: AppliedCoupon | null;
  customerName: string;
}

function itemLineTotal(item: CartItem): number {
  const unitPrice = item.product.promo_price ?? item.product.price;
  return unitPrice * item.quantity;
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + itemLineTotal(item), 0);
}

export function calcDiscount(subtotal: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return subtotal * (coupon.value / 100);
  return Math.min(coupon.value, subtotal);
}

/** Monta a mensagem formatada que será enviada via WhatsApp (wa.me). */
export function buildOrderMessage({
  tenant,
  items,
  coupon,
  customerName,
}: BuildOrderMessageParams): string {
  const subtotal = calcSubtotal(items);
  const discount = calcDiscount(subtotal, coupon);
  const deliveryFee = tenant.delivery_fee ?? 0;
  const total = subtotal - discount + deliveryFee;

  const lines: string[] = [];
  lines.push(`*Novo pedido — ${tenant.name}*`);
  lines.push('');
  if (customerName) lines.push(`Cliente: ${customerName}`);
  lines.push('');
  lines.push('*Itens:*');

  items.forEach((item) => {
    const unitPrice = item.product.promo_price ?? item.product.price;
    lines.push(
      `• ${item.quantity}x ${item.product.name} — ${formatCurrency(unitPrice * item.quantity)}`
    );
    if (item.notes.trim()) {
      lines.push(`   _obs: ${item.notes.trim()}_`);
    }
  });

  lines.push('');
  lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
  if (coupon) {
    lines.push(`Cupom (${coupon.code}): -${formatCurrency(discount)}`);
  }
  lines.push(`Taxa de entrega: ${formatCurrency(deliveryFee)}`);
  lines.push(`*Total: ${formatCurrency(total)}*`);

  return lines.join('\n');
}

/** Gera o link wa.me com a mensagem já codificada. */
export function buildWhatsAppLink(phoneE164: string, message: string): string {
  const digitsOnly = phoneE164.replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
