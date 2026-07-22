import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/admin/Sidebar';
import { useTenant } from '@/hooks/useTenant';

export function AdminLayout() {
  const { tenant, loading, error } = useTenant();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-surface px-4 text-center">
        <h1 className="font-display text-xl font-bold text-ink">Estabelecimento não encontrado</h1>
        <p className="max-w-sm text-sm text-ink-muted">
          Não foi possível identificar o estabelecimento a partir deste endereço. Verifique se o
          link/domínio acessado corresponde a um estabelecimento cadastrado.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Sidebar />
      <main className="p-4 sm:ml-60 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
