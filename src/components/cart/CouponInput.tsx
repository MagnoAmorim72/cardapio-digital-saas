import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { useTenant } from '@/hooks/useTenant';
import { validateCoupon } from '@/services/couponService';

export function CouponInput() {
  const { tenant } = useTenant();
  const { coupon, applyCoupon, removeCoupon, subtotal } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    if (!tenant || !code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await validateCoupon(tenant.id, code, subtotal);
      if (!result.valid || !result.coupon) {
        setError(result.reason ?? 'Cupom inválido.');
        return;
      }
      applyCoupon({
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
      });
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
        <span className="flex items-center gap-1.5 font-semibold">
          <Tag className="h-4 w-4" /> Cupom {coupon.code} aplicado
        </span>
        <button onClick={removeCoupon} aria-label="Remover cupom">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Cupom de desconto"
          aria-label="Código do cupom"
          className="flex-1 rounded-xl border border-ink/15 bg-surface px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <Button variant="outline" size="sm" onClick={handleApply} isLoading={loading}>
          Aplicar
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
