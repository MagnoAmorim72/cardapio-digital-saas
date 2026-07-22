import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { listProducts, type ProductFilters } from '@/services/productService';

export function useProducts(tenantId: string | undefined, filters: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let active = true;
    setLoading(true);
    setError(null);
    listProducts(tenantId, filters)
      .then((data) => active && setProducts(data))
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Erro ao carregar produtos.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, JSON.stringify(filters)]);

  return { products, loading, error };
}
