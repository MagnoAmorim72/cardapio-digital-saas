import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { MenuPage } from '@/pages/public/MenuPage';
import { PaymentResultPage } from '@/pages/public/PaymentResultPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// O painel administrativo é carregado sob demanda (code-splitting) para
// manter o bundle inicial do cardápio público — a parte acessada pelo
// cliente final via QR Code — o menor possível.
const LoginPage = lazy(() => import('@/pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const BannersPage = lazy(() => import('@/pages/admin/BannersPage').then((m) => ({ default: m.BannersPage })));
const CouponsPage = lazy(() => import('@/pages/admin/CouponsPage').then((m) => ({ default: m.CouponsPage })));
const OrdersPage = lazy(() => import('@/pages/admin/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PrintStationPage = lazy(() => import('@/pages/admin/PrintStationPage').then((m) => ({ default: m.PrintStationPage })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Cardápio público — resolvido por subdomínio/tenant */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<MenuPage />} />
      </Route>

      {/* Retorno do pagamento com cartão (Mercado Pago redireciona pra cá) */}
      <Route path="/pagamento/sucesso" element={<PaymentResultPage status="success" />} />
      <Route path="/pagamento/pendente" element={<PaymentResultPage status="pending" />} />
      <Route path="/pagamento/erro" element={<PaymentResultPage status="error" />} />

      {/* Autenticação do painel */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminFallback />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* Painel administrativo — protegido por sessão Supabase Auth */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<AdminFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <Suspense fallback={<AdminFallback />}>
                <ProductsPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <Suspense fallback={<AdminFallback />}>
                <CategoriesPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <Suspense fallback={<AdminFallback />}>
                <BannersPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/cupons"
            element={
              <Suspense fallback={<AdminFallback />}>
                <CouponsPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/pedidos"
            element={
              <Suspense fallback={<AdminFallback />}>
                <OrdersPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/configuracoes"
            element={
              <Suspense fallback={<AdminFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>

        {/* Painel de Impressão — tela "de quiosque" própria, sem menu lateral,
            pensada para ficar aberta o tempo todo numa tela dedicada. */}
        <Route
          path="/admin/impressao"
          element={
            <Suspense fallback={<AdminFallback />}>
              <PrintStationPage />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
