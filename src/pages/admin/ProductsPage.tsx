import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/admin/DataTable';
import { ProductForm, type ProductFormValues } from '@/components/admin/ProductForm';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  listProducts, createProduct, updateProduct, deleteProduct, toggleAvailability,
} from '@/services/productService';
import type { Product } from '@/types';

export function ProductsPage() {
  const { tenant } = useTenant();
  const { categories } = useCategories(tenant?.id);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function reload() {
    if (!tenant) return;
    setLoading(true);
    try {
      setProducts(await listProducts(tenant.id, {}));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  async function handleSubmit(values: ProductFormValues & { slug: string }) {
    if (!tenant) return;
    const payload = {
      tenant_id: tenant.id,
      category_id: values.category_id,
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      ingredients: values.ingredients ? values.ingredients.split(',').map((s) => s.trim()) : null,
      image_url: values.image_url || null,
      price: values.price,
      promo_price: values.promo_price || null,
      prep_time_minutes: values.prep_time_minutes || null,
      tags: values.tags,
      is_available: values.is_available,
      is_featured: values.is_featured,
      display_order: editing?.display_order ?? 0,
    };

    if (editing) {
      await updateProduct(editing.id, payload);
    } else {
      await createProduct(payload);
    }
    setShowForm(false);
    setEditing(null);
    await reload();
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Remover "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    await deleteProduct(product.id);
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Produtos</h1>
          <p className="text-sm text-ink-muted">Gerencie os itens do seu cardápio.</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : (
        <DataTable
          rows={products}
          keyExtractor={(p) => p.id}
          emptyMessage="Nenhum produto cadastrado ainda."
          columns={[
            {
              header: 'Produto',
              render: (p) => (
                <div className="flex items-center gap-3 px-4 py-3">
                  {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                  <span className="font-medium text-ink">{p.name}</span>
                </div>
              ),
            },
            { header: 'Categoria', render: (p) => p.category?.name ?? '—' },
            {
              header: 'Preço',
              render: (p) => (
                <span className="font-mono">
                  {p.promo_price ? (
                    <>
                      <span className="text-ink-muted line-through mr-1">{formatCurrency(p.price)}</span>
                      {formatCurrency(p.promo_price)}
                    </>
                  ) : (
                    formatCurrency(p.price)
                  )}
                </span>
              ),
            },
            {
              header: 'Disponível',
              render: (p) => (
                <button
                  onClick={() => toggleAvailability(p.id, !p.is_available).then(reload)}
                  className={
                    p.is_available
                      ? 'rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500'
                      : 'rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-500'
                  }
                >
                  {p.is_available ? 'Sim' : 'Não'}
                </button>
              ),
            },
            {
              header: '',
              render: (p) => (
                <div className="flex justify-end gap-2 px-4">
                  <button aria-label="Editar" onClick={() => { setEditing(p); setShowForm(true); }} className="text-ink-muted hover:text-ink">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button aria-label="Excluir" onClick={() => handleDelete(p)} className="text-ink-muted hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar produto' : 'Novo produto'} size="lg">
        {tenant && (
          <ProductForm
            tenantId={tenant.id}
            categories={categories}
            initialProduct={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </Modal>
    </div>
  );
}
