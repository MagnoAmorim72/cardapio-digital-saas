import { useCallback, useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, CalendarDays, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { useTenant } from '@/hooks/useTenant';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { getDashboardStats, type DashboardStats } from '@/services/orderService';
import { formatCurrency } from '@/utils/formatCurrency';

export function DashboardPage() {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    if (!tenant) return;
    getDashboardStats(tenant.id)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [tenant]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Assim que um pedido novo chega no banco, as estatísticas são recarregadas
  // automaticamente — sem precisar dar F5 no painel.
  useRealtimeOrders(tenant?.id, loadStats);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-display text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-muted">Visão geral do seu estabelecimento.</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Atualização automática
        </span>
      </div>

      {loading || !stats ? (
        <p className="text-sm text-ink-muted">Carregando estatísticas...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pedidos hoje" value={String(stats.ordersToday)} icon={ShoppingCart} />
            <StatCard label="Faturamento hoje" value={formatCurrency(stats.revenueToday)} icon={DollarSign} />
            <StatCard label="Pedidos no mês" value={String(stats.ordersThisMonth)} icon={CalendarDays} />
            <StatCard label="Faturamento no mês" value={formatCurrency(stats.revenueThisMonth)} icon={TrendingUp} />
          </div>

          <div className="mt-8 rounded-card bg-surface-raised p-5 shadow-card">
            <h2 className="mb-4 font-display text-base font-bold text-ink">Produtos mais vendidos</h2>
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-ink-muted">Ainda não há vendas registradas.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {stats.topProducts.map((p, idx) => (
                  <li key={p.name} className="flex items-center justify-between border-b border-ink/5 py-2 last:border-0">
                    <span className="text-sm text-ink">{idx + 1}. {p.name}</span>
                    <span className="text-sm font-semibold text-ink-muted">{p.count} vendidos</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
