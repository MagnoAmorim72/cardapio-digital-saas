import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { ProductTag } from '@/types';
import { PRODUCT_TAG_LABELS } from '@/types';

const TAG_STYLES: Record<ProductTag, string> = {
  novo: 'bg-blue-500 text-white',
  promocao: 'bg-brand-primary text-white',
  mais_vendido: 'bg-amber-500 text-white',
  vegano: 'bg-emerald-500 text-white',
  sem_gluten: 'bg-purple-500 text-white',
};

export function TagBadge({ tag }: { tag: ProductTag }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-hard-sm',
        TAG_STYLES[tag]
      )}
    >
      {PRODUCT_TAG_LABELS[tag]}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-ink-muted',
        className
      )}
    >
      {children}
    </span>
  );
}
