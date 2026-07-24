import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { TagBadge } from '@/components/ui/Badge';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
  product: Product;
}

/**
 * Card de produto, estilo retrô: contorno grosso + sombra dura com
 * deslocamento sólido (assinatura visual do tema). Produtos em promoção
 * ganham um selo circular sobre a foto, como uma etiqueta de "oferta".
 */
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasPromo = product.promo_price != null;
  const displayPrice = hasPromo ? product.promo_price! : product.price;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Ver detalhes de ${product.name}`}
        className="group flex flex-col overflow-hidden rounded-card border-2 border-ink/10 bg-surface-raised text-left shadow-hard-sm transition-shadow hover:border-ink/20 disabled:opacity-60"
        disabled={!product.is_available}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-muted text-sm">
              Sem foto
            </div>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink">
                Indisponível
              </span>
            </div>
          )}
          {product.tags.length > 0 && (
            <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
              {product.tags.slice(0, 2).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
          {hasPromo && (
            <div className="absolute -bottom-4 -right-3 flex h-16 w-16 rotate-6 flex-col items-center justify-center rounded-full border-2 border-ink bg-brand-primary text-center leading-none text-white shadow-hard-sm">
              <span className="font-mono text-[13px] font-bold">{formatCurrency(displayPrice)}</span>
              <span className="text-[8px] font-bold uppercase tracking-wide">Só hoje</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <h3 className="font-display text-[16px] font-semibold leading-snug text-ink line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-ink-muted line-clamp-2">{product.description}</p>
          )}

          <div className="mt-2 flex items-end justify-between border-t-2 border-dashed border-ink/15 pt-2.5">
            <div className="flex flex-col">
              {hasPromo && (
                <span className="text-xs text-ink-muted line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="font-mono text-base font-bold text-brand-primary">
                {formatCurrency(displayPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {product.prep_time_minutes && (
                <span className="flex items-center gap-0.5 text-[11px] text-ink-muted">
                  <Clock className="h-3 w-3" /> {product.prep_time_minutes}min
                </span>
              )}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-brand-primary text-white">
                <Plus className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </motion.button>

      {isOpen && <ProductModal product={product} onClose={() => setIsOpen(false)} />}
    </>
  );
});
