import { Search, Moon, Sun, ShoppingBag } from 'lucide-react';
import type { Tenant } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  tenant: Tenant;
  search: string;
  onSearchChange: (value: string) => void;
}

export function Header({ tenant, search, onSearchChange }: HeaderProps) {
  const { mode, toggle } = useTheme();
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {tenant.logo_url ? (
          <img
            src={tenant.logo_url}
            alt={tenant.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-ink/10"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary font-display font-bold text-white">
            {tenant.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold text-ink">{tenant.name}</h1>
        </div>

        <button
          onClick={toggle}
          aria-label="Alternar tema claro/escuro"
          className="rounded-full p-2 text-ink-muted hover:bg-surface-raised"
        >
          {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          onClick={openCart}
          aria-label={`Abrir carrinho, ${itemCount} itens`}
          className="relative rounded-full p-2 text-ink-muted hover:bg-surface-raised"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            type="search"
            placeholder="Buscar no cardápio..."
            aria-label="Buscar produtos"
            className="w-full rounded-full border border-ink/15 bg-surface-raised py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>
    </header>
  );
}
