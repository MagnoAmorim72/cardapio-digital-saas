import { useMemo, useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { Header } from '@/components/menu/Header';
import { Hero } from '@/components/menu/Hero';
import { CategoryChips } from '@/components/menu/CategoryChips';
import { ProductGrid } from '@/components/menu/ProductGrid';
import { Footer } from '@/components/menu/Footer';

type QuickFilter = 'all' | 'promo' | 'best_sellers';

/**
 * Landing page do cardápio digital: hero institucional, filtros rápidos,
 * categorias e grade de produtos com busca em tempo real (debounced).
 */
export function MenuPage() {
  const { tenant } = useTenant();
  const { categories } = useCategories(tenant?.id);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(
    () => ({
      categoryId,
      search: debouncedSearch,
      onlyAvailable: false,
      onlyPromo: quickFilter === 'promo',
      onlyBestSellers: quickFilter === 'best_sellers',
    }),
    [categoryId, debouncedSearch, quickFilter]
  );

  const { products, loading } = useProducts(tenant?.id, filters);

  if (!tenant) return null;

  return (
    <>
      <Header tenant={tenant} search={search} onSearchChange={setSearch} />
      <Hero tenant={tenant} />

      <div className="mx-auto max-w-3xl">
        <div className="mt-5 flex gap-2 px-4">
          {(
            [
              ['all', 'Tudo'],
              ['promo', 'Promoções'],
              ['best_sellers', 'Mais vendidos'],
            ] as [QuickFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setQuickFilter(value)}
              className={
                quickFilter === value
                  ? 'rounded-full bg-brand-secondary px-3.5 py-1.5 text-xs font-bold text-ink'
                  : 'rounded-full bg-surface-raised px-3.5 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink'
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <CategoryChips categories={categories} activeId={categoryId} onSelect={setCategoryId} />
        </div>

        <div className="mt-4">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage="Nenhum produto encontrado para essa busca."
          />
        </div>
      </div>

      <Footer tenant={tenant} />
    </>
  );
}
