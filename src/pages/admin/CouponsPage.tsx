import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/admin/DataTable';
import { listCoupons, createCoupon, deleteCoupon } from '@/services/couponService';
import type { Coupon } from '@/types';

interface CouponFormValues {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number | null;
}

export function CouponsPage() {
  const { tenant } = useTenant();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CouponFormValues>({
    defaultValues: { type: 'percent', min_order_value: 0 },
  });

  async function reload() {
    if (!tenant) return;
    setLoading(true);
    try {
      setCoupons(await listCoupons(tenant.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  async function onSubmit(values: CouponFormValues) {
    if (!tenant) return;
    await createCoupon({
      tenant_id: tenant.id,
      code: values.code.toUpperCase(),
      type: values.type,
      value: values.value,
      min_order_value: values.min_order_value || 0,
      max_uses: values.max_uses || null,
      valid_from: new Date().toISOString(),
      valid_until: null,
      is_active: true,
    });
    reset();
    setShowForm(false);
    await reload();
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Remover o cupom "${coupon.code}"?`)) return;
    await deleteCoupon(coupon.id);
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Cupons</h1>
          <p className="text-sm text-ink-muted">Crie descontos para seus clientes.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Novo cupom
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : (
        <DataTable
          rows={coupons}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhum cupom cadastrado ainda."
          columns={[
            { header: 'Código', render: (c) => <span className="px-4 py-3 font-mono font-semibold">{c.code}</span> },
            { header: 'Tipo', render: (c) => (c.type === 'percent' ? 'Percentual' : 'Valor fixo') },
            { header: 'Valor', render: (c) => (c.type === 'percent' ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`) },
            { header: 'Usos', render: (c) => `${c.used_count}${c.max_uses ? `/${c.max_uses}` : ''}` },
            {
              header: '',
              render: (c) => (
                <div className="flex justify-end px-4">
                  <button aria-label="Excluir" onClick={() => handleDelete(c)} className="text-ink-muted hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo cupom">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Código" {...register('code', { required: true })} placeholder="Ex: BEMVINDO10" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Tipo de desconto</label>
            <select {...register('type')} className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink">
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <Input label="Valor" type="number" step="0.01" {...register('value', { required: true, valueAsNumber: true })} />
          <Input label="Pedido mínimo (R$)" type="number" step="0.01" {...register('min_order_value', { valueAsNumber: true })} />
          <Input label="Limite de usos (opcional)" type="number" {...register('max_uses', { valueAsNumber: true })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Criar cupom</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
