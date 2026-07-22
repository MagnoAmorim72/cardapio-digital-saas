import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useTenant } from '@/hooks/useTenant';
import { CartItemRow } from './CartItemRow';
import { CouponInput } from './CouponInput';
import { PixCheckout } from './PixCheckout';
import { DeliveryAddressInput } from './DeliveryAddressInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatCurrency';
import { buildOrderMessage, buildWhatsAppLink } from '@/utils/whatsapp';
import { createOrder } from '@/services/orderService';

export function CartDrawer() {
  const { tenant } = useTenant();
  const {
    items, isOpen, closeCart, subtotal, discount, deliveryFee, total, coupon, clearCart,
  } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mapsLink, setMapsLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!tenant) return null;

  async function handleCheckout() {
    if (!tenant || items.length === 0) return;
    setSubmitting(true);
    try {
      const message = buildOrderMessage({
        tenant,
        items,
        coupon,
        customerName,
        deliveryAddress,
        mapsLink,
      });
      const waLink = tenant.whatsapp_number ? buildWhatsAppLink(tenant.whatsapp_number, message) : null;

      // Celulares tratam window.open('_blank') como pop-up e costumam bloquear
      // silenciosamente, sem nenhum aviso visível. Em telas pequenas, navegamos
      // a própria aba para o link — o sistema do celular reconhece o wa.me e
      // abre o app do WhatsApp diretamente, sem passar por bloqueio de pop-up.
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // No desktop, abrimos o WhatsApp AGORA, ainda dentro do clique do usuário.
      // Se isso vier depois de um "await", o navegador bloqueia o popup.
      if (waLink && !isMobile) {
        window.open(waLink, '_blank');
      }

      // Registrar o pedido não deve impedir o envio pelo WhatsApp caso falhe
      // (ex: instabilidade momentânea de rede) — por isso tem seu próprio try/catch.
      try {
        await createOrder({
          tenant_id: tenant.id,
          customer_name: customerName || null,
          customer_phone: null,
          items: items.map((i) => ({
            product_id: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            unit_price: i.product.promo_price ?? i.product.price,
            notes: i.notes || undefined,
          })),
          coupon_code: coupon?.code ?? null,
          subtotal,
          discount,
          delivery_fee: deliveryFee,
          total,
          notes: [deliveryAddress.trim(), mapsLink].filter(Boolean).join(' | ') || null,
        });
      } catch (err) {
        console.error('Falha ao registrar o pedido no painel (o pedido ainda foi enviado por WhatsApp):', err);
      }

      // No celular, navegamos só depois do await acima — diferente do
      // window.open, a navegação da própria aba não é bloqueada por isso.
      if (waLink && isMobile) {
        window.location.href = waLink;
      }

      clearCart();
      setDeliveryAddress('');
      setMapsLink(null);
      closeCart();
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-label="Carrinho de compras"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <ShoppingBag className="h-5 w-5" /> Seu pedido
              </h2>
              <button onClick={closeCart} aria-label="Fechar carrinho" className="rounded-full p-1.5 hover:bg-surface-raised">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-muted">Seu carrinho está vazio.</p>
              ) : (
                items.map((item) => <CartItemRow key={item.cartItemId} item={item} />)
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/10 p-4">
                <div className="mb-3">
                  <CouponInput />
                </div>

                <Input
                  label="Seu nome"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="mb-3"
                />

                <DeliveryAddressInput
                  address={deliveryAddress}
                  onAddressChange={setDeliveryAddress}
                  onLocationCaptured={setMapsLink}
                />

                <div className="mb-4 space-y-1 text-sm">
                  <div className="flex justify-between text-ink-muted">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Desconto</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-muted">
                    <span>Entrega</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-ink/15 pt-1.5 text-base font-bold text-ink">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </div>
                </div>

                {tenant.pix_key && <PixCheckout tenant={tenant} amount={total} />}

                <Button
                  onClick={handleCheckout}
                  isLoading={submitting}
                  className="w-full"
                  size="lg"
                >
                  Finalizar pelo WhatsApp
                </Button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
