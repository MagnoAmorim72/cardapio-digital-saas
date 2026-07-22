import { Outlet } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { CartProvider } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

/** Layout base das páginas públicas (cardápio). Lida com estados de loading/erro do tenant. */
export function PublicLayout() {
  const { tenant, loading, error } = useTenant();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-surface px-4 text-center">
        <h1 className="font-display text-xl font-bold text-ink">Cardápio não encontrado</h1>
        <p className="text-sm text-ink-muted">
          Verifique o endereço acessado ou entre em contato com o estabelecimento.
        </p>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-surface text-ink">
        <Outlet />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
