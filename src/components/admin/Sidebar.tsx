import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UtensilsCrossed, Tags, Ticket, ShoppingCart, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: UtensilsCrossed },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/cupons', label: 'Cupons', icon: Ticket },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

interface NavListProps {
  onNavigate?: () => void;
}

function NavList({ onNavigate }: NavListProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-primary text-white' : 'text-ink-muted hover:bg-surface hover:text-ink'
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Navegação do painel administrativo.
 * - Telas >= sm: barra lateral fixa, sempre visível.
 * - Telas < sm (celular): vira uma topbar com botão de menu (hambúrguer)
 *   que abre um drawer deslizante — o mesmo padrão usado no CartDrawer do
 *   cardápio público, para manter a linguagem visual consistente.
 */
export function Sidebar() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Topbar — visível apenas em telas pequenas */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-surface-raised px-4 py-3 sm:hidden">
        <div>
          <h1 className="font-display text-base font-bold text-ink">Painel Admin</h1>
          <p className="text-[11px] text-ink-muted">Cardápio Digital SaaS</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-ink hover:bg-surface"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar fixa — visível a partir de sm */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-ink/10 bg-surface-raised p-4 sm:flex">
        <div className="mb-6 px-2">
          <h1 className="font-display text-lg font-bold text-ink">Painel Admin</h1>
          <p className="text-xs text-ink-muted">Cardápio Digital SaaS</p>
        </div>
        <NavList />
        <button
          onClick={logout}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface hover:text-red-500"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      {/* Drawer mobile */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-40 flex sm:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60"
                onClick={() => setMobileOpen(false)}
                aria-hidden
              />
              <motion.aside
                role="dialog"
                aria-label="Menu do painel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22 }}
                className="relative z-10 flex h-full w-72 max-w-[80%] flex-col bg-surface-raised p-4"
              >
                <div className="mb-6 flex items-center justify-between px-2">
                  <div>
                    <h1 className="font-display text-lg font-bold text-ink">Painel Admin</h1>
                    <p className="text-xs text-ink-muted">Cardápio Digital SaaS</p>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Fechar menu"
                    className="rounded-full p-1.5 text-ink-muted hover:bg-surface"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <NavList onNavigate={() => setMobileOpen(false)} />

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
