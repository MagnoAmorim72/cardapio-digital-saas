import { supabase } from './supabaseClient';
import type { Order, OrderStatus } from '@/types';

export async function createOrder(
  payload: Omit<Order, 'id' | 'created_at' | 'status'>
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...payload, status: 'pending' })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
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

  const [todayRes, monthRes, productsRes] = await Promise.all([
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
    supabase
      .from('products')
      .select('name, sold_count')
      .eq('tenant_id', tenantId)
      .order('sold_count', { ascending: false })
      .limit(5),
  ]);

  if (todayRes.error) throw todayRes.error;
  if (monthRes.error) throw monthRes.error;
  if (productsRes.error) throw productsRes.error;

  const ordersToday = todayRes.data.length;
  const revenueToday = todayRes.data.reduce((sum, o) => sum + Number(o.total), 0);
  const ordersThisMonth = monthRes.data.length;
  const revenueThisMonth = monthRes.data.reduce((sum, o) => sum + Number(o.total), 0);
  const topProducts = productsRes.data.map((p) => ({ name: p.name, count: p.sold_count }));

  return { ordersToday, revenueToday, ordersThisMonth, revenueThisMonth, topProducts };
}
