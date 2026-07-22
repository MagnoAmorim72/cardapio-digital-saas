import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { ProductTag } from '@/types';
import { PRODUCT_TAG_LABELS } from '@/types';

const TAG_STYLES: Record<ProductTag, string> = {
  novo: 'bg-blue-500/15 text-blue-400',
  promocao: 'bg-brand-primary/15 text-brand-primary',
  mais_vendido: 'bg-amber-500/15 text-amber-400',
  vegano: 'bg-emerald-500/15 text-emerald-400',
  sem_gluten: 'bg-purple-500/15 text-purple-400',
};

export function TagBadge({ tag }: { tag: ProductTag }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
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
