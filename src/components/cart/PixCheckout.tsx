import { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { buildPixPayload } from '@/utils/pix';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Tenant } from '@/types';

interface PixCheckoutProps {
  tenant: Tenant;
  amount: number;
}

/**
 * Mostra o código "Pix Copia e Cola" já com o valor do pedido preenchido.
 * Não substitui a confirmação manual (o cliente ainda envia o comprovante
 * pelo WhatsApp) — é uma melhoria de atrito enquanto não há um gateway de
 * pagamento automático integrado (ver docs/CUSTOMIZATION.md, fase Premium).
 */
export function PixCheckout({ tenant, amount }: PixCheckoutProps) {
  const [copied, setCopied] = useState(false);

  if (!tenant.pix_key) return null;

  const payload = buildPixPayload({
    key: tenant.pix_key,
    merchantName: tenant.name,
    merchantCity: 'BRASIL',
    amount,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mb-3 rounded-xl border border-dashed border-brand-primary/40 bg-brand-primary/5 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <QrCode className="h-4 w-4 text-brand-primary" />
        Pagar com Pix
      </div>
      <p className="mb-2 text-xs text-ink-muted">
        Copie o código abaixo e cole no app do seu banco (opção "Pix Copia e Cola") para pagar{' '}
        <span className="font-semibold text-ink">{formatCurrency(amount)}</span>. Depois, envie o
        comprovante junto com o pedido no WhatsApp.
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" /> Código copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Copiar código Pix
          </>
        )}
      </button>
    </div>
  );
}
