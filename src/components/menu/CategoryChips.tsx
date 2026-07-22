import {
  Beef, CupSoda, IceCreamCone, Pizza, Salad, Sandwich, Soup, Fish, Cookie,
  Coffee, Wine, Utensils, UtensilsCrossed, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Category } from '@/types';

// Mapa explícito (em vez de `import * as Icons`) para manter o tree-shaking
// eficiente: cada ícone só entra no bundle se estiver de fato listado aqui.
// Para adicionar um novo ícone de categoria, importe-o do lucide-react
// (https://lucide.dev/icons) e inclua-o neste mapa.
const ICON_MAP: Record<string, LucideIcon> = {
  Beef, CupSoda, IceCreamCone, Pizza, Salad, Sandwich, Soup, Fish, Cookie,
  Coffee, Wine, Utensils, UtensilsCrossed,
};

interface CategoryChipsProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

function CategoryIcon({ name }: { name: string | null }) {
  const IconComponent = name ? ICON_MAP[name] : null;
  if (!IconComponent) return null;
  return <IconComponent className="h-4 w-4" />;
}

export function CategoryChips({ categories, activeId, onSelect }: CategoryChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="Categorias"
      className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        role="tab"
        aria-selected={activeId === null}
        onClick={() => onSelect(null)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
          activeId === null
            ? 'bg-brand-primary text-white'
            : 'bg-surface-raised text-ink-muted hover:text-ink'
        )}
      >
        Tudo
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
            activeId === cat.id
              ? 'bg-brand-primary text-white'
              : 'bg-surface-raised text-ink-muted hover:text-ink'
          )}
        >
          <CategoryIcon name={cat.icon} />
          {cat.name}
        </button>
      ))}
    </div>
  );
}
