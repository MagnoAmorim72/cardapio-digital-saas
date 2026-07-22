import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Tenant } from '@/types';
import { getTenantBySlug, resolveTenantSlug } from '@/services/tenantService';

interface TenantContextValue {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

/**
 * Carrega o tenant (empresa) atual com base no subdomínio/slug e o
 * disponibiliza para toda a árvore de componentes. Também aplica o tema
 * de cores do tenant nas CSS variables globais.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const slug = resolveTenantSlug();
      const found = await getTenantBySlug(slug);
      if (!found) {
        setError('Estabelecimento não encontrado.');
        setTenant(null);
        return;
      }
      setTenant(found);
      applyTenantTheme(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estabelecimento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading, error, reload: load }}>
      {children}
    </TenantContext.Provider>
  );
}

function applyTenantTheme(tenant: Tenant) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', tenant.theme.primary);
  root.style.setProperty('--brand-secondary', tenant.theme.secondary);
  root.classList.toggle('dark', tenant.theme.mode === 'dark');
}

export function useTenantContext(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenantContext deve ser usado dentro de <TenantProvider>');
  return ctx;
}
