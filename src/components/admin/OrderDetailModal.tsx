import { MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Order, PaymentMethod, PaymentStatus } from '@/types';

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  whatsapp: 'Combinado no WhatsApp',
  pix: 'Pix (manual)',
  card: 'Cartão online',
};
const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  not_applicable: '',
  pending: 'Aguardando pagamento',
  approved: 'Pago',
  rejected: 'Recusado',
};
const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  not_applicable: 'text-ink-muted',
  pending: 'text-amber-500',
  approved: 'text-emerald-500',
  rejected: 'text-red-500',
};

/** O endereço fica salvo em `notes`, junto com o link do mapa, separados por " | ". */
function parseDeliveryNotes(notes: string | null): { address: string | null; mapsLink: string | null } {
  if (!notes) return { address: null, mapsLink: null };
  const parts = notes.split(' | ').map((p) => p.trim());
  const mapsLink = parts.find((p) => p.startsWith('http')) ?? null;
  const address = parts.find((p) => !p.startsWith('http')) ?? null;
  return { address, mapsLink };
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

/** Janela com o detalhamento completo de um pedido — itens, valores, entrega e pagamento. */
export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;
  const { address, mapsLink } = parseDeliveryNotes(order.notes);

  return (
    <Modal isOpen onClose={onClose} title={`Pedido #${order.id.slice(0, 8).toUpperCase()}`} size="md">
      <p className="mb-4 text-xs text-ink-muted">
        {new Date(order.created_at).toLocaleString('pt-BR')}
      </p>

      <div className="mb-4 flex flex-col gap-1 text-sm">
        <p>
          <span className="font-semibold text-ink">Cliente: </span>
          <span className="text-ink-muted">{order.customer_name || 'Não informado'}</span>
        </p>
        <p className="flex items-start gap-1">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <span className="text-ink-muted">{address || 'Retirada no balcão'}</span>
        </p>
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="ml-4 text-xs font-semibold text-brand-primary hover:underline"
          >
            Ver localização no mapa
          </a>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-ink/10">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-3 border-b border-ink/5 p-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                {item.quantity}x {item.name}
              </p>
              {item.notes && <p className="text-xs text-ink-muted">Obs: {item.notes}</p>}
            </div>
            <span className="shrink-0 font-mono text-sm text-ink">
              {formatCurrency(item.unit_price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-1 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-emerald-500">
            <span>Desconto {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-muted">
          <span>Entrega</span>
          <span>{formatCurrency(order.delivery_fee)}</span>
        </div>
        <div className="flex justify-between border-t border-dashed border-ink/15 pt-1.5 text-base font-bold text-ink">
          <span>Total</span>
          <span className="font-mono">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="rounded-xl bg-surface p-3 text-sm">
        <p className="font-medium text-ink">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
        {order.payment_status !== 'not_applicable' && (
          <p className={`text-xs font-semibold ${PAYMENT_STATUS_STYLE[order.payment_status]}`}>
            {PAYMENT_STATUS_LABEL[order.payment_status]}
          </p>
        )}
      </div>
    </Modal>
  );
}
