import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, RotateCcw, ArrowLeft } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { listOrders } from '@/services/orderService';
import { PrintTicket } from '@/components/admin/PrintTicket';
import type { Order } from '@/types';

const STORAGE_KEYS = {
  autoPrint: 'cardapio:print-station:auto',
  printKitchen: 'cardapio:print-station:kitchen',
  printRegister: 'cardapio:print-station:register',
};

function readBoolPref(key: string, defaultValue: boolean): boolean {
  const raw = localStorage.getItem(key);
  return raw === null ? defaultValue : raw === 'true';
}

/**
 * Painel de impressão automática — pensado para ficar aberto o tempo todo
 * numa tela dedicada no balcão/cozinha. Assim que um pedido novo chega
 * (via Realtime), imprime sozinho a via da cozinha e/ou do caixa.
 *
 * Não usa o AdminLayout de propósito: é uma tela "de quiosque", sem menu
 * lateral, para não atrapalhar quando maximizada num tablet/monitor extra.
 */
export function PrintStationPage() {
  const { tenant } = useTenant();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<Order[]>([]);
  const [printing, setPrinting] = useState<Order | null>(null);

  const [autoPrint, setAutoPrint] = useState(() => readBoolPref(STORAGE_KEYS.autoPrint, true));
  const [printKitchen, setPrintKitchen] = useState(() => readBoolPref(STORAGE_KEYS.printKitchen, true));
  const [printRegister, setPrintRegister] = useState(() => readBoolPref(STORAGE_KEYS.printRegister, true));

  useEffect(() => localStorage.setItem(STORAGE_KEYS.autoPrint, String(autoPrint)), [autoPrint]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.printKitchen, String(printKitchen)), [printKitchen]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.printRegister, String(printRegister)), [printRegister]);

  useEffect(() => {
    if (!tenant) return;
    listOrders(tenant.id).then((orders) => setRecentOrders(orders.slice(0, 15)));
  }, [tenant?.id]);

  const enqueue = useCallback((order: Order) => {
    setQueue((prev) => [...prev, order]);
  }, []);

  useRealtimeOrders(tenant?.id, (order) => {
    setRecentOrders((prev) => [order, ...prev].slice(0, 15));
    if (autoPrint) enqueue(order);
  });

  // Processa a fila um pedido de cada vez — evita que dois pedidos chegando
  // juntos disparem impressões sobrepostas/embaralhadas.
  useEffect(() => {
    if (printing || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setPrinting(next);
  }, [printing, queue]);

  const afterPrintRef = useRef(() => setPrinting(null));
  useEffect(() => {
    afterPrintRef.current = () => setPrinting(null);
  });

  useEffect(() => {
    function handleAfterPrint() {
      afterPrintRef.current();
    }
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  useEffect(() => {
    if (!printing) return;
    // Pequeno atraso para garantir que o ticket já foi desenhado na tela
    // antes de chamar a impressão.
    const timer = setTimeout(() => window.print(), 150);
    return () => clearTimeout(timer);
  }, [printing]);

  function reprint(order: Order) {
    if (printing) {
      enqueue(order);
    } else {
      setPrinting(order);
    }
  }

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Painel de controle — não aparece na impressão. */}
      <div className="print:hidden">
        <header className="border-b border-ink/10 bg-surface-raised p-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/admin" className="rounded-full p-1.5 text-ink-muted hover:bg-surface">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <Printer className="h-5 w-5 text-brand-primary" /> Painel de Impressão
                </h1>
                <p className="text-xs text-ink-muted">
                  Deixe esta tela aberta no balcão/cozinha para imprimir pedidos automaticamente.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Conectado
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-3xl p-4">
          <section className="mb-6 rounded-card bg-surface-raised p-4 shadow-card">
            <h2 className="mb-3 font-display text-sm font-bold text-ink">Configuração desta tela</h2>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Imprimir pedidos novos automaticamente
              </label>
              <label className="flex items-center gap-2 pl-6">
                <input
                  type="checkbox"
                  checked={printKitchen}
                  onChange={(e) => setPrintKitchen(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Via da cozinha
              </label>
              <label className="flex items-center gap-2 pl-6">
                <input
                  type="checkbox"
                  checked={printRegister}
                  onChange={(e) => setPrintRegister(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Via do caixa/cliente
              </label>
            </div>
            {queue.length > 0 && (
              <p className="mt-3 text-xs font-semibold text-amber-500">
                {queue.length} pedido(s) aguardando na fila de impressão...
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-display text-sm font-bold text-ink">Pedidos recentes</h2>
            <div className="flex flex-col gap-2">
              {recentOrders.length === 0 && (
                <p className="text-sm text-ink-muted">Nenhum pedido ainda.</p>
              )}
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl bg-surface-raised p-3 shadow-card"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      #{order.id.slice(0, 8).toUpperCase()} — {order.customer_name || 'Cliente'}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {new Date(order.created_at).toLocaleString('pt-BR')} · {order.items.length} item(ns)
                    </p>
                  </div>
                  <button
                    onClick={() => reprint(order)}
                    className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reimprimir
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Área que efetivamente é impressa — invisível na tela, só aparece no papel. */}
      <div className="hidden print:block">
        {printing && (
          <>
            {printKitchen && <PrintTicket order={printing} tenant={tenant} variant="kitchen" />}
            {printKitchen && printRegister && <div className="break-after-page" />}
            {printRegister && <PrintTicket order={printing} tenant={tenant} variant="register" />}
          </>
        )}
      </div>
    </div>
  );
}
