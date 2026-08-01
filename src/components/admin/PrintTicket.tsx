import type { Order, Tenant, PaymentMethod } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  whatsapp: 'Combinado no WhatsApp',
  pix: 'Pix',
  card: 'Cartão online',
};

/** O endereço fica salvo em `notes`, junto com o link do mapa, separados por " | ". */
function extractAddress(notes: string | null): string | null {
  if (!notes) return null;
  const address = notes.split(' | ').find((p) => !p.trim().startsWith('http'));
  return address?.trim() || null;
}

interface PrintTicketProps {
  order: Order;
  tenant: Tenant;
  variant: 'kitchen' | 'register';
}

/**
 * Uma via impressa (cozinha ou caixa), no formato estreito de cupom —
 * funciona tanto em impressora térmica de comanda quanto em impressora
 * comum (o navegador só ajusta a página conforme o driver instalado).
 */
export function PrintTicket({ order, tenant, variant }: PrintTicketProps) {
  const address = extractAddress(order.notes);
  const dateLabel = new Date(order.created_at).toLocaleString('pt-BR');

  return (
    <div className="mx-auto w-[80mm] whitespace-pre-wrap break-words bg-white p-2 font-mono text-[11px] leading-snug text-black">
      {variant === 'kitchen' ? (
        <p className="mb-1 text-center text-base font-bold">*** COZINHA ***</p>
      ) : (
        <p className="mb-1 text-center text-base font-bold">{tenant.name}</p>
      )}

      <p className="text-center">{dateLabel}</p>
      <p className="text-center">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
      <Divider />

      {order.customer_name && <p>Cliente: {order.customer_name}</p>}
      <p>Entrega: {address || 'RETIRADA NO BALCÃO'}</p>
      <Divider />

      {order.items.map((item, idx) => (
        <div key={idx} className="mb-1">
          <div className="flex justify-between">
            <span>
              {item.quantity}x {item.name}
            </span>
            {variant === 'register' && <span>{formatCurrency(item.unit_price * item.quantity)}</span>}
          </div>
          {item.notes && <p className="pl-3 italic">obs: {item.notes}</p>}
        </div>
      ))}
      <Divider />

      {variant === 'register' && (
        <>
          <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
          {order.discount > 0 && <Row label="Desconto" value={`-${formatCurrency(order.discount)}`} />}
          <Row label="Entrega" value={formatCurrency(order.delivery_fee)} />
          <div className="mt-1 flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <Divider />
        </>
      )}

      <p>
        Pagamento: {PAYMENT_LABEL[order.payment_method]}
        {order.payment_status === 'approved' && ' (PAGO)'}
      </p>

      {variant === 'register' && (
        <p className="mt-2 text-center">Obrigado pela preferência!</p>
      )}
    </div>
  );
}

function Divider() {
  return <p className="my-1">--------------------------------</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
