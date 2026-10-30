import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, OrderItem, StoreSettings } from '../types';

// Read from env or local config
const ENV_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const SUPABASE_STORAGE_BUCKET = 'book-covers';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  try {
    const customConfig = localStorage.getItem('medi_custom_supabase_config');
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key };
      }
    }
  } catch (err) {
    console.warn('Error reading custom Supabase config:', err);
  }
  return { url: ENV_SUPABASE_URL, key: ENV_SUPABASE_KEY };
}

export function saveStoredSupabaseConfig(url: string, key: string): void {
  localStorage.setItem('medi_custom_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  const currentKey = `${url}___${key}`;
  if (!cachedClient || cachedConfigKey !== currentKey) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      cachedConfigKey = currentKey;
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
}

// Complete Supabase SQL Script to be provided in Admin setup
export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- MEDI NURSING BOOK STORE - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Organization: MEDI Nursing Admission Coaching, Jessore
-- Strict 100% Free Plan Architecture
-- ==============================================================================

-- 1. PROFILES TABLE (ADMIN USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  bangla_title TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'common',
  cover_image TEXT NOT NULL,
  regular_price NUMERIC(10, 2) NOT NULL CHECK (regular_price >= 0),
  offer_price NUMERIC(10, 2) NOT NULL CHECK (offer_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  pages INTEGER,
  edition TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_charge NUMERIC(10, 2) NOT NULL CHECK (delivery_charge >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  archived_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR MAXIMUM QUERY SPEED
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active, deleted_at, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES:
-- 1. PRODUCTS: Anyone can read active, non-deleted books. Only authenticated admins can insert/update/delete.
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. ORDERS: Anyone can submit an order. Only admins can read/update/delete orders.
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. ORDER ITEMS
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins have full access to order items" ON public.order_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. STORE SETTINGS: Public can read settings. Only admins can update.
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" ON public.store_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can update store settings" ON public.store_settings;
CREATE POLICY "Admins can update store settings" ON public.store_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ENABLE REALTIME ON KEY TABLES
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE products, orders, store_settings;
COMMIT;

-- STORAGE BUCKET CONFIGURATION (Run in Supabase SQL editor or Storage UI)
-- Insert storage bucket for 'book-covers' if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public can view images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');

-- Storage Policy: Authenticated users can upload and delete images
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'book-covers');
`;
