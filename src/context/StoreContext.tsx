import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Order, OrderItem, StoreSettings, CartItem, AdminUser, CustomerSummary, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialBooks';
import { getSupabaseClient, isSupabaseConfigured, SUPABASE_STORAGE_BUCKET } from '../services/supabaseClient';
import { generateOrderNumber } from '../utils/orderUtils';
import { optimizeBookImage } from '../utils/imageOptimizer';
import { idbGet, idbSet } from '../utils/indexedDbStorage';

interface StoreContextType {
  products: Product[];
  activeProducts: Product[];
  trashProducts: Product[];
  cart: CartItem[];
  orders: Order[];
  archivedOrders: Order[];
  customers: CustomerSummary[];
  settings: StoreSettings;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  isSupabaseLive: boolean;
  freeTierUsage: {
    productCount: number;
    orderCount: number;
    estimatedStorageKb: number;
    isNearLimit: boolean;
  };
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  // Order Actions
  placeOrder: (orderData: {
    customer_name: string;
    phone: string;
    alternate_phone?: string;
    district: string;
    upazila: string;
    address: string;
    notes?: string;
    delivery_charge: number;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  archiveOrder: (orderId: string) => Promise<void>;
  restoreOrder: (orderId: string) => Promise<void>;
  permanentlyDeleteOrder: (orderId: string) => Promise<void>;
  // Book Management Actions
  addProduct: (newBook: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  softDeleteProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  permanentlyDeleteProduct: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  reorderProducts: (orderedIds: string[]) => Promise<void>;
  moveProduct: (productId: string, direction: 'up' | 'down') => Promise<void>;
  changeProductOrder: (productId: string, newPosition: number) => Promise<void>;
  // Settings Actions
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  // Auth Actions
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  setupFirstAdmin: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  // Backup & Export
  exportBooksToCSV: () => void;
  exportOrdersToCSV: () => void;
  exportCustomersToCSV: () => void;
  backupAllDataJSON: () => void;
  restoreDataFromJSON: (jsonData: string) => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_PRODUCTS_KEY = 'medi_nursing_products_v1';
const LOCAL_ORDERS_KEY = 'medi_nursing_orders_v1';
const LOCAL_SETTINGS_KEY = 'medi_nursing_settings_v1';
const LOCAL_ADMIN_KEY = 'medi_nursing_admin_v1';
const LOCAL_CUSTOM_USERS_KEY = 'medi_nursing_registered_admins_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading orders from localStorage:', e);
    }
    return [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          facebook_url:
            parsed.facebook_url && !parsed.facebook_url.includes('facebook.com/medinursingjessore')
              ? parsed.facebook_url
              : INITIAL_SETTINGS.facebook_url,
          youtube_url: parsed.youtube_url || INITIAL_SETTINGS.youtube_url,
          azaan_publication_url: parsed.azaan_publication_url || INITIAL_SETTINGS.azaan_publication_url
        };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return INITIAL_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('medi_nursing_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cart:', e);
    }
    return [];
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ADMIN_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading admin user:', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSupabaseLive = isSupabaseConfigured();

  // Load from IndexedDB on initial mount if available
  useEffect(() => {
    idbGet<Product[]>(LOCAL_PRODUCTS_KEY).then((idbProducts) => {
      if (idbProducts && idbProducts.length > 0) {
        setProducts(idbProducts);
      }
    });
    idbGet<Order[]>(LOCAL_ORDERS_KEY).then((idbOrders) => {
      if (idbOrders && idbOrders.length > 0) {
        setOrders(idbOrders);
      }
    });
    idbGet<StoreSettings>(LOCAL_SETTINGS_KEY).then((idbSettings) => {
      if (idbSettings) {
        setSettings((prev) => ({ ...prev, ...idbSettings }));
      }
    });
  }, []);

  // Save to both IndexedDB and localStorage whenever local states change
  useEffect(() => {
    idbSet(LOCAL_PRODUCTS_KEY, products);
    try {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('localStorage products quota note (safely stored in IndexedDB):', e);
    }
  }, [products]);

  useEffect(() => {
    idbSet(LOCAL_ORDERS_KEY, orders);
    try {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('localStorage orders quota note (safely stored in IndexedDB):', e);
    }
  }, [orders]);

  useEffect(() => {
    idbSet(LOCAL_SETTINGS_KEY, settings);
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('medi_nursing_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart:', e);
    }
  }, [cart]);

  // Sync across browser tabs using storage event and BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('medi_store_realtime_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_ALL') {
        const prod = localStorage.getItem(LOCAL_PRODUCTS_KEY);
        const ord = localStorage.getItem(LOCAL_ORDERS_KEY);
        const set = localStorage.getItem(LOCAL_SETTINGS_KEY);
        if (prod) setProducts(JSON.parse(prod));
        if (ord) setOrders(JSON.parse(ord));
        if (set) setSettings(JSON.parse(set));
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_PRODUCTS_KEY && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      } else if (e.key === LOCAL_ORDERS_KEY && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      } else if (e.key === LOCAL_SETTINGS_KEY && e.newValue) {
        setSettings(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const broadcastSync = () => {
    try {
      const channel = new BroadcastChannel('medi_store_realtime_channel');
      channel.postMessage({ type: 'SYNC_ALL', timestamp: Date.now() });
      channel.close();
    } catch (e) {
      // BroadcastChannel optional fallback
    }
  };

  // Supabase real-time and fetch
  const refreshData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setIsSyncing(true);
    try {
      // 1. Fetch products
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!prodErr && dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts as Product[]);
      }

      // 2. Fetch orders
      const { data: dbOrders, error: ordErr } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (!ordErr && dbOrders) {
        setOrders(dbOrders as Order[]);
      }

      // 3. Fetch settings
      const { data: dbSettings, error: setErr } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default_settings')
        .single();

      if (!setErr && dbSettings?.setting_value) {
        setSettings(dbSettings.setting_value as StoreSettings);
      }
    } catch (err) {
      console.warn('Supabase fetch notice (using active local store):', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Subscribe to Supabase Realtime if configured
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    refreshData();

    const channel = supabase
      .channel('medi-public-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  // Filtered views
  const activeProducts = useMemo(() => {
    return products
      .filter((p) => p.is_active && !p.deleted_at)
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [products]);

  const trashProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.deleted_at));
  }, [products]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => !o.archived_at);
  }, [orders]);

  const archivedOrders = useMemo(() => {
    return orders.filter((o) => Boolean(o.archived_at));
  }, [orders]);

  // Derived Customers calculation
  const customers: CustomerSummary[] = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((o) => {
      const key = o.phone.trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          phone: o.phone,
          customer_name: o.customer_name,
          district: o.district,
          total_orders: 1,
          total_spent: o.status !== 'cancelled' ? o.total : 0,
          last_order_date: o.created_at,
          orders: [o]
        });
      } else {
        existing.total_orders += 1;
        if (o.status !== 'cancelled') {
          existing.total_spent += o.total;
        }
        if (new Date(o.created_at) > new Date(existing.last_order_date)) {
          existing.last_order_date = o.created_at;
          existing.customer_name = o.customer_name;
          existing.district = o.district;
        }
        existing.orders.push(o);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total_spent - a.total_spent);
  }, [orders]);

  // Cart Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.offer_price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Placement
  const placeOrder = async (orderData: {
    customer_name: string;
    phone: string;
    alternate_phone?: string;
    district: string;
    upazila: string;
    address: string;
    notes?: string;
    delivery_charge: number;
  }): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'আপনার শপিং কার্ট খালি।' };
    }

    // 1. Verify actual price and stock
    for (const item of cart) {
      const liveProduct = products.find((p) => p.id === item.product.id);
      if (!liveProduct || liveProduct.deleted_at || !liveProduct.is_active) {
        return { success: false, error: `"${item.product.title}" বইটি বর্তমানে অনুপলব্ধ।` };
      }
      if (liveProduct.stock < item.quantity) {
        return { success: false, error: `"${liveProduct.title}" বইটির পর্যাপ্ত স্টক নেই (বর্তমান স্টক: ${liveProduct.stock})।` };
      }
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = generateOrderNumber();

    const orderItems: OrderItem[] = cart.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      product_id: item.product.id,
      product_title: item.product.title,
      quantity: item.quantity,
      unit_price: item.product.offer_price,
      total_price: item.product.offer_price * item.quantity,
      cover_image: item.product.cover_image
    }));

    const subtotal = cartTotal;
    const total = subtotal + orderData.delivery_charge;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_name: orderData.customer_name.trim(),
      phone: orderData.phone.trim(),
      alternate_phone: orderData.alternate_phone?.trim() || '',
      district: orderData.district.trim(),
      upazila: orderData.upazila.trim(),
      address: orderData.address.trim(),
      notes: orderData.notes?.trim() || '',
      subtotal,
      delivery_charge: orderData.delivery_charge,
      total,
      status: 'pending',
      items: orderItems,
      archived_at: null,
      created_at: now,
      updated_at: now
    };

    // 2. Decrement stock
    const updatedProducts = products.map((p) => {
      const foundInCart = cart.find((c) => c.product.id === p.id);
      if (foundInCart) {
        return { ...p, stock: Math.max(0, p.stock - foundInCart.quantity), updated_at: now };
      }
      return p;
    });

    // 3. Save order to Supabase if live
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: ordErr } = await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          customer_name: newOrder.customer_name,
          phone: newOrder.phone,
          alternate_phone: newOrder.alternate_phone,
          district: newOrder.district,
          upazila: newOrder.upazila,
          address: newOrder.address,
          notes: newOrder.notes,
          subtotal: newOrder.subtotal,
          delivery_charge: newOrder.delivery_charge,
          total: newOrder.total,
          status: newOrder.status,
          created_at: newOrder.created_at,
          updated_at: newOrder.updated_at
        });

        if (ordErr) {
          console.warn('Supabase order insert fallback to local:', ordErr);
        } else {
          // Insert order items
          await supabase.from('order_items').insert(
            orderItems.map((item) => ({
              id: item.id,
              order_id: item.order_id,
              product_id: item.product_id,
              product_title: item.product_title,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              cover_image: item.cover_image
            }))
          );

          // Update stock in Supabase
          for (const item of cart) {
            const p = updatedProducts.find((prod) => prod.id === item.product.id);
            if (p) {
              await supabase.from('products').update({ stock: p.stock }).eq('id', p.id);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase remote write error, using local fallback:', err);
      }
    }

    // Update state & clear cart
    setOrders((prev) => [newOrder, ...prev]);
    setProducts(updatedProducts);
    clearCart();
    broadcastSync();

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updated_at: now } : o))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('orders').update({ status, updated_at: now }).eq('id', orderId);
      } catch (e) {
        console.warn('Supabase update order status error:', e);
      }
    }
    broadcastSync();
  };

  const archiveOrder = async (orderId: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, archived_at: now, updated_at: now } : o))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('orders').update({ archived_at: now, updated_at: now }).eq('id', orderId);
      } catch (e) {
        console.warn('Supabase archive order error:', e);
      }
    }
    broadcastSync();
  };

  const restoreOrder = async (orderId: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, archived_at: null, updated_at: now } : o))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('orders').update({ archived_at: null, updated_at: now }).eq('id', orderId);
      } catch (e) {
        console.warn('Supabase restore order error:', e);
      }
    }
    broadcastSync();
  };

  const permanentlyDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.warn('Supabase permanent delete order error:', e);
      }
    }
    broadcastSync();
  };

  // Product Management
  const addProduct = async (
    newBook: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<Product> => {
    const now = new Date().toISOString();
    const id = `medi-book-${Date.now()}`;
    const product: Product = {
      ...newBook,
      id,
      deleted_at: null,
      created_at: now,
      updated_at: now
    };

    setProducts((prev) => [product, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').insert([product]);
      } catch (e) {
        console.warn('Supabase add product error:', e);
      }
    }
    broadcastSync();
    return product;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: now } : p))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').update({ ...updates, updated_at: now }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update product error:', e);
      }
    }
    broadcastSync();
  };

  const softDeleteProduct = async (id: string) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, deleted_at: now, updated_at: now } : p))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').update({ deleted_at: now, updated_at: now }).eq('id', id);
      } catch (e) {
        console.warn('Supabase soft delete error:', e);
      }
    }
    broadcastSync();
  };

  const restoreProduct = async (id: string) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, deleted_at: null, updated_at: now } : p))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').update({ deleted_at: null, updated_at: now }).eq('id', id);
      } catch (e) {
        console.warn('Supabase restore product error:', e);
      }
    }
    broadcastSync();
  };

  const permanentlyDeleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase permanent delete error:', e);
      }
    }
    broadcastSync();
  };

  const emptyTrash = async () => {
    const trashIds = trashProducts.map((p) => p.id);
    setProducts((prev) => prev.filter((p) => !p.deleted_at));
    const supabase = getSupabaseClient();
    if (supabase && trashIds.length > 0) {
      try {
        await supabase.from('products').delete().in('id', trashIds);
      } catch (e) {
        console.warn('Supabase empty trash error:', e);
      }
    }
    broadcastSync();
  };

  const reorderProducts = async (orderedIds: string[]) => {
    const now = new Date().toISOString();
    const idMap = new Map<string, number>();
    orderedIds.forEach((id, idx) => {
      idMap.set(id, idx + 1);
    });

    let nextOrder = orderedIds.length + 1;
    let updatedProductsList: Product[] = [];

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (idMap.has(p.id)) {
          return { ...p, sort_order: idMap.get(p.id)!, updated_at: now };
        }
        return { ...p, sort_order: nextOrder++, updated_at: now };
      });
      updatedProductsList = updated;
      return updated;
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await supabase
            .from('products')
            .update({ sort_order: i + 1, updated_at: now })
            .eq('id', orderedIds[i]);
        }
      } catch (e) {
        console.warn('Supabase reorder sync error:', e);
      }
    }
    broadcastSync();
  };

  const moveProduct = async (productId: string, direction: 'up' | 'down') => {
    const activeList = products
      .filter((p) => !p.deleted_at)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const index = activeList.findIndex((p) => p.id === productId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeList.length) return;

    const reordered = [...activeList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await reorderProducts(reordered.map((p) => p.id));
  };

  const changeProductOrder = async (productId: string, newPosition: number) => {
    const activeList = products
      .filter((p) => !p.deleted_at)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const index = activeList.findIndex((p) => p.id === productId);
    if (index === -1) return;

    const targetIndex = Math.max(0, Math.min(newPosition - 1, activeList.length - 1));
    if (targetIndex === index) return;

    const reordered = [...activeList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await reorderProducts(reordered.map((p) => p.id));
  };

  // Image Upload Handler with auto-compression
  const uploadProductImage = async (file: File): Promise<string> => {
    // 1. Optimize and compress the image first so it is lightweight (~50-80KB)
    let optimizedDataUrl: string;
    try {
      optimizedDataUrl = await optimizeBookImage(file, {
        maxWidth: 650,
        maxHeight: 900,
        quality: 0.85,
        format: 'image/jpeg'
      });
    } catch (optErr) {
      console.warn('Image optimization notice, using direct read:', optErr);
      optimizedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('ছবি পড়া সম্ভব হয়নি।'));
        reader.readAsDataURL(file);
      });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const res = await fetch(optimizedDataUrl);
        const blob = await res.blob();
        const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError) {
          const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(fileName);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload notice, using local optimized image:', uploadError);
        }
      } catch (err) {
        console.warn('Storage upload notice, falling back to optimized image:', err);
      }
    }

    return optimizedDataUrl;
  };

  // Settings
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('store_settings').upsert({
          id: 'default_settings',
          setting_key: 'general_settings',
          setting_value: updated,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Supabase update settings error:', e);
      }
    }
    broadcastSync();
  };

  // Authentication
  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: pass
        });
        if (!error && data.user) {
          const user: AdminUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            role: 'super_admin',
            full_name: data.user.user_metadata?.full_name || 'Admin'
          };
          setAdminUser(user);
          localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase auth failed, checking local authorized accounts:', err);
      }
    }

    // Check registered admin accounts in local storage
    const customAdminsRaw = localStorage.getItem(LOCAL_CUSTOM_USERS_KEY);
    const customAdmins = customAdminsRaw ? JSON.parse(customAdminsRaw) : [];
    const found = customAdmins.find((a: any) => a.email === trimmedEmail && a.password === pass);

    if (found) {
      const user: AdminUser = {
        id: found.id,
        email: found.email,
        role: found.role || 'admin',
        full_name: found.full_name || 'Admin'
      };
      setAdminUser(user);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
      return { success: true };
    }

    // Default primary admin account for MEDI Coaching
    if (trimmedEmail === 'admin@medinursing.com' && pass === 'MediAdmin@2026') {
      const user: AdminUser = {
        id: 'admin-master-001',
        email: 'admin@medinursing.com',
        role: 'super_admin',
        full_name: 'মেডি নার্সিং ডিরেক্টর'
      };
      setAdminUser(user);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
      return { success: true };
    }

    return { success: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
  };

  const setupFirstAdmin = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass || pass.length < 6) {
      return { success: false, error: 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' };
    }
    const trimmedEmail = email.trim().toLowerCase();
    const customAdminsRaw = localStorage.getItem(LOCAL_CUSTOM_USERS_KEY);
    const customAdmins = customAdminsRaw ? JSON.parse(customAdminsRaw) : [];

    if (customAdmins.some((a: any) => a.email === trimmedEmail)) {
      return { success: false, error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি এডমিন অ্যাকাউন্ট আছে।' };
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      email: trimmedEmail,
      password: pass,
      full_name: name,
      role: 'admin' as const,
      created_at: new Date().toISOString()
    };

    customAdmins.push(newAdmin);
    localStorage.setItem(LOCAL_CUSTOM_USERS_KEY, JSON.stringify(customAdmins));

    const user: AdminUser = {
      id: newAdmin.id,
      email: newAdmin.email,
      role: 'admin',
      full_name: newAdmin.full_name
    };
    setAdminUser(user);
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
    return { success: true };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  // Free Tier Usage Calculation & Warning
  const freeTierUsage = useMemo(() => {
    const productCount = products.length;
    const orderCount = orders.length;
    // Estimate JSON storage size
    const estBytes = (JSON.stringify(products).length + JSON.stringify(orders).length);
    const estimatedStorageKb = Math.round(estBytes / 1024);
    // Supabase Free tier gives 500MB database, 1GB storage, 50,000 MAU.
    // We warn when orders > 10,000 or products > 500
    const isNearLimit = orderCount > 8000 || productCount > 400;
    return {
      productCount,
      orderCount,
      estimatedStorageKb,
      isNearLimit
    };
  }, [products, orders]);

  // CSV Exports
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBooksToCSV = () => {
    const headers = ['ID', 'Title', 'Regular Price', 'Offer Price', 'Stock', 'Category', 'Status', 'Edition'];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      p.regular_price,
      p.offer_price,
      p.stock,
      `"${p.category || 'common'}"`,
      p.deleted_at ? 'Deleted' : p.is_active ? 'Active' : 'Inactive',
      `"${p.edition || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `medi_books_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportOrdersToCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'District', 'Upazila', 'Address', 'Subtotal', 'Delivery Charge', 'Total', 'Status', 'Items'];
    const rows = orders.map((o) => {
      const itemsText = o.items.map((i) => `${i.product_title} (x${i.quantity})`).join('; ');
      return [
        `"${o.order_number}"`,
        `"${new Date(o.created_at).toLocaleString()}"`,
        `"${o.customer_name.replace(/"/g, '""')}"`,
        `"${o.phone}"`,
        `"${o.district}"`,
        `"${o.upazila}"`,
        `"${o.address.replace(/"/g, '""')}"`,
        o.subtotal,
        o.delivery_charge,
        o.total,
        `"${o.status}"`,
        `"${itemsText.replace(/"/g, '""')}"`
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `medi_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportCustomersToCSV = () => {
    const headers = ['Customer Name', 'Phone', 'District', 'Total Orders', 'Total Spent (BDT)', 'Last Order Date'];
    const rows = customers.map((c) => [
      `"${c.customer_name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.district}"`,
      c.total_orders,
      c.total_spent,
      `"${new Date(c.last_order_date).toLocaleDateString()}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `medi_customers_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const backupAllDataJSON = () => {
    const backupData = {
      version: '1.0',
      export_date: new Date().toISOString(),
      store: 'MEDI Nursing Book Store',
      products,
      orders,
      settings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medi_nursing_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const restoreDataFromJSON = async (jsonData: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        return { success: false, message: 'অবৈধ ব্যাকআপ ফাইল। প্রোডাক্ট ডাটা পাওয়া যায়নি।' };
      }
      setProducts(parsed.products);
      if (parsed.orders && Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      broadcastSync();
      return { success: true, message: 'ব্যাকআপ ডাটা সফলভাবে রিস্টোর করা হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: `রিস্টোর ব্যর্থ হয়েছে: ${err.message}` };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        activeProducts,
        trashProducts,
        cart,
        orders: activeOrders,
        archivedOrders,
        customers,
        settings,
        adminUser,
        isAdmin: Boolean(adminUser),
        isLoading,
        isSyncing,
        isSupabaseLive,
        freeTierUsage,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        placeOrder,
        updateOrderStatus,
        archiveOrder,
        restoreOrder,
        permanentlyDeleteOrder,
        addProduct,
        updateProduct,
        softDeleteProduct,
        restoreProduct,
        permanentlyDeleteProduct,
        emptyTrash,
        uploadProductImage,
        reorderProducts,
        moveProduct,
        changeProductOrder,
        updateSettings,
        loginAdmin,
        logoutAdmin,
        setupFirstAdmin,
        exportBooksToCSV,
        exportOrdersToCSV,
        exportCustomersToCSV,
        backupAllDataJSON,
        restoreDataFromJSON,
        refreshData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
