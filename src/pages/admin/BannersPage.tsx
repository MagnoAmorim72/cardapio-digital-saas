import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/admin/DataTable';
import { BannerForm, type BannerFormValues } from '@/components/admin/BannerForm';
import {
  listBannersAdmin, createBanner, updateBanner, deleteBanner,
} from '@/services/bannerService';
import type { Banner } from '@/types';

export function BannersPage() {
  const { tenant } = useTenant();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function reload() {
    if (!tenant) return;
    setLoading(true);
    try {
      setBanners(await listBannersAdmin(tenant.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  async function handleSubmit(values: BannerFormValues & { image_url: string }) {
    if (!tenant) return;
    const payload = {
      tenant_id: tenant.id,
      title: values.title || null,
      subtitle: values.subtitle || null,
      image_url: values.image_url,
      is_active: values.is_active,
      display_order: editing?.display_order ?? banners.length,
    };
    if (editing) {
      await updateBanner(editing.id, payload);
    } else {
      await createBanner(payload);
    }
    setShowForm(false);
    setEditing(null);
    await reload();
  }

  async function handleDelete(banner: Banner) {
    if (!confirm('Remover este banner?')) return;
    await deleteBanner(banner.id);
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Banners</h1>
          <p className="text-sm text-ink-muted">
            Campanhas e propagandas próprias, exibidas junto com seus produtos em destaque no carrossel do cardápio.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Novo banner
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : (
        <DataTable
          rows={banners}
          keyExtractor={(b) => b.id}
          emptyMessage="Nenhum banner cadastrado ainda. O carrossel mostra só os produtos em destaque/promoção enquanto isso."
          columns={[
            {
              header: 'Banner',
              render: (b) => (
                <div className="flex items-center gap-3 px-4 py-3">
                  <img src={b.image_url} alt="" className="h-10 w-16 rounded-lg object-cover" />
                  <span className="font-medium text-ink">{b.title || '(sem título)'}</span>
                </div>
              ),
            },
            {
              header: 'Ativo',
              render: (b) => (
                <button
                  onClick={() => updateBanner(b.id, { is_active: !b.is_active }).then(reload)}
                  className={
                    b.is_active
                      ? 'rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500'
                      : 'rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-500'
                  }
                >
                  {b.is_active ? 'Sim' : 'Não'}
                </button>
              ),
            },
            {
              header: '',
              render: (b) => (
                <div className="flex justify-end gap-2 px-4">
                  <button aria-label="Editar" onClick={() => { setEditing(b); setShowForm(true); }} className="text-ink-muted hover:text-ink">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button aria-label="Excluir" onClick={() => handleDelete(b)} className="text-ink-muted hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar banner' : 'Novo banner'}>
        {tenant && (
          <BannerForm
            tenantId={tenant.id}
            initialBanner={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </Modal>
    </div>
  );
}
