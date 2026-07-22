import { useEffect, useState } from 'react';
import type { Category } from '@/types';
import { listCategories } from '@/services/categoryService';

export function useCategories(tenantId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    let active = true;
    setLoading(true);
    listCategories(tenantId)
      .then((data) => active && setCategories(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tenantId]);

  return { categories, loading };
}
