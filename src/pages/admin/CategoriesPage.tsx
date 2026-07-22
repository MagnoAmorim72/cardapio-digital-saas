import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/admin/DataTable';
import { CategoryForm, type CategoryFormValues } from '@/components/admin/CategoryForm';
import {
  listCategoriesAdmin, createCategory, updateCategory, deleteCategory,
} from '@/services/categoryService';
import type { Category } from '@/types';

export function CategoriesPage() {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function reload() {
    if (!tenant) return;
    setLoading(true);
    try {
      setCategories(await listCategoriesAdmin(tenant.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  async function handleSubmit(values: CategoryFormValues & { slug: string }) {
    if (!tenant) return;
    const payload = {
      tenant_id: tenant.id,
      name: values.name,
      slug: values.slug,
      icon: values.icon || null,
      is_featured: values.is_featured,
      is_active: values.is_active,
      display_order: editing?.display_order ?? categories.length,
    };
    if (editing) {
      await updateCategory(editing.id, payload);
    } else {
      await createCategory(payload);
    }
    setShowForm(false);
    setEditing(null);
    await reload();
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Remover a categoria "${category.name}"? Produtos vinculados ficarão sem categoria.`)) return;
    await deleteCategory(category.id);
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Categorias</h1>
          <p className="text-sm text-ink-muted">Organize os produtos do seu cardápio.</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : (
        <DataTable
          rows={categories}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhuma categoria cadastrada ainda."
          columns={[
            { header: 'Nome', render: (c) => <span className="px-4 py-3 font-medium text-ink">{c.name}</span> },
            { header: 'Destaque', render: (c) => (c.is_featured ? 'Sim' : 'Não') },
            { header: 'Ativa', render: (c) => (c.is_active ? 'Sim' : 'Não') },
            {
              header: '',
              render: (c) => (
                <div className="flex justify-end gap-2 px-4">
                  <button aria-label="Editar" onClick={() => { setEditing(c); setShowForm(true); }} className="text-ink-muted hover:text-ink">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button aria-label="Excluir" onClick={() => handleDelete(c)} className="text-ink-muted hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <CategoryForm initialCategory={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
