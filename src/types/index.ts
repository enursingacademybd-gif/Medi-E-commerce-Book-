export interface Product {
  id: string;
  title: string;
  bangla_title?: string;
  slug: string;
  description: string;
  category?: 'bsc' | 'diploma' | 'midwifery' | 'common' | 'question_bank';
  cover_image: string;
  regular_price: number;
  offer_price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  pages?: number;
  edition?: string;
  features?: string[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cover_image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  alternate_phone?: string;
  district: string;
  upazila: string;
  address: string;
  notes?: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary {
  phone: string;
  customer_name: string;
  district: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  orders: Order[];
}

export interface StoreSettings {
  website_name: string;
  logo: string;
  tagline: string;
  whatsapp_number: string;
  whatsapp_international: string;
  contact_phone: string;
  facebook_url: string;
  youtube_url?: string;
  azaan_publication_url?: string;
  address_text: string;
  delivery_charge_jessore: number;
  delivery_charge_outside: number;
  banner_headline: string;
  banner_subtitle: string;
  notice_text: string;
  free_delivery_threshold?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  full_name: string;
}
