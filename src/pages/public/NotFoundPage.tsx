import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center text-ink">
      <h1 className="font-display text-2xl font-bold">404</h1>
      <p className="text-sm text-ink-muted">Página não encontrada.</p>
      <Link to="/" className="text-sm font-semibold text-brand-primary underline">
        Voltar ao cardápio
      </Link>
    </div>
  );
}
