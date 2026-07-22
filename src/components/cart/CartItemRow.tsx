import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCart } from '@/contexts/CartContext';
import type { CartItem } from '@/types';

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const unitPrice = item.product.promo_price ?? item.product.price;

  return (
    <div className="flex gap-3 border-b border-ink/10 py-3">
      {item.product.image_url && (
        <img
          src={item.product.image_url}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink line-clamp-1">{item.product.name}</h4>
          <button
            onClick={() => removeItem(item.cartItemId)}
            aria-label={`Remover ${item.product.name}`}
            className="shrink-0 text-ink-muted hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {item.notes && <p className="text-xs text-ink-muted line-clamp-1">Obs: {item.notes}</p>}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-ink/15 px-1.5 py-1">
            <button
              aria-label="Diminuir"
              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
              className="rounded p-0.5 hover:bg-surface-raised"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              aria-label="Aumentar"
              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              className="rounded p-0.5 hover:bg-surface-raised"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="font-mono text-sm font-bold text-ink">
            {formatCurrency(unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
