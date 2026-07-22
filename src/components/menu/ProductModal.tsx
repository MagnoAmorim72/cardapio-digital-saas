import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TagBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const hasPromo = product.promo_price != null;
  const unitPrice = hasPromo ? product.promo_price! : product.price;

  function handleAdd() {
    addItem(product, quantity, notes);
    onClose();
  }

  return (
    <Modal isOpen onClose={onClose} title={product.name} size="md">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="mb-4 h-48 w-full rounded-xl object-cover"
        />
      )}

      {product.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {product.description && (
        <p className="mb-3 text-sm text-ink-muted">{product.description}</p>
      )}

      {product.ingredients && product.ingredients.length > 0 && (
        <p className="mb-4 text-xs text-ink-muted">
          <span className="font-semibold text-ink">Ingredientes: </span>
          {product.ingredients.join(', ')}
        </p>
      )}

      <div className="mb-4 flex items-baseline gap-2">
        {hasPromo && (
          <span className="text-sm text-ink-muted line-through">
            {formatCurrency(product.price)}
          </span>
        )}
        <span className="font-mono text-xl font-bold text-brand-primary">
          {formatCurrency(unitPrice)}
        </span>
      </div>

      <label htmlFor="notes" className="mb-1 block text-sm font-medium text-ink">
        Observações
      </label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ex: sem cebola, ponto da carne, etc."
        rows={2}
        className="mb-4 w-full rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-ink/15 px-2 py-1.5">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="rounded-lg p-1 text-ink hover:bg-surface"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-semibold text-ink">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            onClick={() => setQuantity((q) => q + 1)}
            className="rounded-lg p-1 text-ink hover:bg-surface"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button onClick={handleAdd} className="flex-1" disabled={!product.is_available}>
          Adicionar · {formatCurrency(unitPrice * quantity)}
        </Button>
      </div>
    </Modal>
  );
}
