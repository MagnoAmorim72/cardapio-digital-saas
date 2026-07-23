import { supabase } from './supabaseClient';
import type { Order, OrderItemSnapshot, OrderStatus } from '@/types';

export async function createOrder(payload: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<void> {
  // Sem .select().single(): o carrinho não precisa ler o pedido de volta,
  // só criá-lo. Pedir a linha de volta ("Prefer: return=representation")
  // exigiria também permissão de LEITURA sobre pedidos — que é restrita ao
  // admin do estabelecimento — e travaria a criação para clientes anônimos
  // (o caso normal de um cliente comprando pelo cardápio).
  const { error } = await supabase.from('orders').insert({ ...payload, status: 'pending' });
  if (error) throw error;
}

export async function listOrders(
  tenantId: string,
  status?: OrderStatus
): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Order[];
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  topProducts: { name: string; count: number }[];
}

/** Estatísticas básicas para o dashboard administrativo. */
export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todayRes, monthRes, allOrdersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('total')
      .eq('tenant_id', tenantId)
      .gte('created_at', startOfDay.toISOString()),
    supabase
      .from('orders')
      .select('total')
      .eq('tenant_id', tenantId)
      .gte('created_at', startOfMonth.toISOString()),
    // "Mais vendidos" é calculado direto dos itens de cada pedido (fonte de
    // verdade), em vez de um contador separado em products.sold_count — isso
    // evita o contador ficar desatualizado e já reflete todo o histórico.
    supabase.from('orders').select('items').eq('tenant_id', tenantId),
  ]);

  if (todayRes.error) throw todayRes.error;
  if (monthRes.error) throw monthRes.error;
  if (allOrdersRes.error) throw allOrdersRes.error;

  const ordersToday = todayRes.data.length;
  const revenueToday = todayRes.data.reduce((sum, o) => sum + Number(o.total), 0);
  const ordersThisMonth = monthRes.data.length;
  const revenueThisMonth = monthRes.data.reduce((sum, o) => sum + Number(o.total), 0);

  const soldByProduct = new Map<string, number>();
  for (const order of allOrdersRes.data) {
    const items = (order.items ?? []) as OrderItemSnapshot[];
    for (const item of items) {
      soldByProduct.set(item.name, (soldByProduct.get(item.name) ?? 0) + item.quantity);
    }
  }
  const topProducts = Array.from(soldByProduct.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { ordersToday, revenueToday, ordersThisMonth, revenueThisMonth, topProducts };
}
