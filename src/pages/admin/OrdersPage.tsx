import { useCallback, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
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

/** O endereço e o link do mapa são salvos juntos em `notes`, separados por " | ". */
function parseDeliveryNotes(notes: string | null): { address: string | null; mapsLink: string | null } {
  if (!notes) return { address: null, mapsLink: null };
  const parts = notes.split(' | ').map((p) => p.trim());
  const mapsLink = parts.find((p) => p.startsWith('http')) ?? null;
  const address = parts.find((p) => !p.startsWith('http')) ?? null;
  return { address, mapsLink };
}

export function OrdersPage() {
  const { tenant } = useTenant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(
    async (options?: { showSpinner?: boolean }) => {
      if (!tenant) return;
      if (options?.showSpinner) setLoading(true);
      try {
        setOrders(await listOrders(tenant.id));
      } finally {
        if (options?.showSpinner) setLoading(false);
      }
    },
    [tenant]
  );

  useEffect(() => {
    reload({ showSpinner: true });
  }, [reload]);

  // Novos pedidos entram na lista automaticamente, sem F5 (recarrega em
  // segundo plano, sem piscar o spinner de carregamento).
  useRealtimeOrders(tenant?.id, () => reload());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Pedidos</h1>
          <p className="text-sm text-ink-muted">Acompanhe os pedidos enviados via WhatsApp.</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Atualização automática
        </span>
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
            {
              header: 'Entrega',
              render: (o) => {
                const { address, mapsLink } = parseDeliveryNotes(o.notes);
                if (!address && !mapsLink) return <span className="text-ink-muted">—</span>;
                return (
                  <div className="flex max-w-[220px] flex-col gap-0.5">
                    {address && <span className="line-clamp-2 text-xs text-ink">{address}</span>}
                    {mapsLink && (
                      <a
                        href={mapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                      >
                        <MapPin className="h-3 w-3" /> Ver no mapa
                      </a>
                    )}
                  </div>
                );
              },
            },
            { header: 'Itens', render: (o) => `${o.items.length} item(ns)` },
            { header: 'Total', render: (o) => <span className="font-mono">{formatCurrency(o.total)}</span> },
            {
              header: 'Status',
              render: (o) => (
                <select
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus).then(() => reload())}
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
