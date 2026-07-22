// Tipagem central do sistema. Mantida em espelho com as tabelas do Supabase
// (supabase/schema.sql) para garantir consistência entre banco e frontend.

export type ProductTag =
  | 'novo'
  | 'promocao'
  | 'mais_vendido'
  | 'vegano'
  | 'sem_gluten';

export const PRODUCT_TAG_LABELS: Record<ProductTag, string> = {
  novo: 'Novo',
  promocao: 'Promoção',
  mais_vendido: 'Mais vendido',
  vegano: 'Vegano',
  sem_gluten: 'Sem Glúten',
};

export type WeekDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export type OpeningHours = Record<WeekDay, DayHours>;

export interface TenantTheme {
  primary: string; // "R G B", ex: "255 90 31"
  secondary: string;
  mode: 'light' | 'dark';
}

export interface Tenant {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'suspended' | 'trial';
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  whatsapp_number: string | null;
  pix_key: string | null;
  address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  delivery_fee: number;
  min_order_value: number;
  opening_hours: OpeningHours;
  theme: TenantTheme;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string[] | null;
  image_url: string | null;
  price: number;
  promo_price: number | null;
  prep_time_minutes: number | null;
  tags: ProductTag[];
  is_available: boolean;
  is_featured: boolean;
  sold_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
  // relação populada opcionalmente pelas queries
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
}

export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface OrderItemSnapshot {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItemSnapshot[];
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------
// Tipos exclusivos do frontend (não existem como tabela)
// ---------------------------------------------------------------------

export interface CartItem {
  cartItemId: string; // uuid gerado no client (permite 2 entradas do mesmo produto com obs. diferentes)
  product: Product;
  quantity: number;
  notes: string;
}

export interface AppliedCoupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
}

export interface TenantUserRole {
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'staff';
}
