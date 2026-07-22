import { useEffect, useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { DataTable } from '@/components/admin/DataTable';
import { listOrders, updateOrderStatus } from '@/services/orderService';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Order, OrderStatus } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  delivering: 'Saiu p/ entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function OrdersPage() {
  const { tenant } = useTenant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!tenant) return;
    setLoading(true);
    try {
      setOrders(await listOrders(tenant.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Pedidos</h1>
        <p className="text-sm text-ink-muted">Acompanhe os pedidos enviados via WhatsApp.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : (
        <DataTable
          rows={orders}
          keyExtractor={(o) => o.id}
          emptyMessage="Nenhum pedido registrado ainda."
          columns={[
            {
              header: 'Data',
              render: (o) => new Date(o.created_at).toLocaleString('pt-BR'),
            },
            { header: 'Cliente', render: (o) => o.customer_name ?? '—' },
            { header: 'Itens', render: (o) => `${o.items.length} item(ns)` },
            { header: 'Total', render: (o) => <span className="font-mono">{formatCurrency(o.total)}</span> },
            {
              header: 'Status',
              render: (o) => (
                <select
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus).then(reload)}
                  className="rounded-lg border border-ink/15 bg-surface px-2 py-1 text-xs"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
