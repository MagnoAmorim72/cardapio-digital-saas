import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product, AppliedCoupon } from '@/types';
import { calcSubtotal, calcDiscount } from '@/utils/whatsapp';
import { useTenantContext } from './TenantContext';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity: number, notes: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  coupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function storageKey(tenantId: string | undefined) {
  return `cardapio:cart:${tenantId ?? 'default'}`;
}

/**
 * Estado do carrinho, isolado por tenant (persistido em localStorage por
 * empresa para não misturar pedidos entre cardápios diferentes).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { tenant } = useTenantContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    const raw = localStorage.getItem(storageKey(tenant.id));
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        setItems([]);
      }
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenant) return;
    localStorage.setItem(storageKey(tenant.id), JSON.stringify(items));
  }, [items, tenant?.id]);

  function addItem(product: Product, quantity: number, notes: string) {
    setItems((prev) => [
      ...prev,
      { cartItemId: crypto.randomUUID(), product, quantity, notes },
    ]);
    setIsOpen(true);
  }

  function removeItem(cartItemId: string) {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
    );
  }

  function updateNotes(cartItemId: string, notes: string) {
    setItems((prev) => prev.map((i) => (i.cartItemId === cartItemId ? { ...i, notes } : i)));
  }

  function clearCart() {
    setItems([]);
    setCoupon(null);
  }

  const subtotal = useMemo(() => calcSubtotal(items), [items]);
  const discount = useMemo(() => calcDiscount(subtotal, coupon), [subtotal, coupon]);
  const deliveryFee = items.length > 0 ? tenant?.delivery_fee ?? 0 : 0;
  const total = subtotal - discount + deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        coupon,
        applyCoupon: setCoupon,
        removeCoupon: () => setCoupon(null),
        subtotal,
        discount,
        deliveryFee,
        total,
        itemCount,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>');
  return ctx;
}
