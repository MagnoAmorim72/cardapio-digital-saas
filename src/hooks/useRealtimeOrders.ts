import { useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import type { Order } from '@/types';

/**
 * Escuta em tempo real (via Supabase Realtime) por novos pedidos do tenant
 * atual, chamando `onNewOrder` assim que um pedido é inserido no banco —
 * usado para o painel admin se atualizar sozinho, sem precisar de F5, e
 * também para a impressão automática (que precisa dos dados do pedido).
 *
 * Pré-requisito no banco: a tabela `orders` precisa estar habilitada para
 * replicação em tempo real (ver supabase/schema.sql).
 */
export function useRealtimeOrders(
  tenantId: string | undefined,
  onNewOrder: (order: Order) => void
) {
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`orders-realtime-${tenantId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        (payload) => onNewOrder(payload.new as Order)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);
}
