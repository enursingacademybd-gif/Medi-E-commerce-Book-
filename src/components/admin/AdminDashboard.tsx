import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus } from '../../types';
import { toBengaliDigits, calculateDiscountPercent } from '../../utils/orderUtils';
import { SUPABASE_SETUP_SQL, saveStoredSupabaseConfig, getStoredSupabaseConfig } from '../../services/supabaseClient';
import { BookFormModal } from './BookFormModal';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Users,
  Trash2,
  Settings,
  Database,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  Edit,
  Sparkles,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  Server,
  ArrowUp,
  ArrowDown,
  ListOrdered
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onPrintInvoice: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore, onPrintInvoice }) => {
  const {
    products,
    trashProducts,
    orders,
    archivedOrders,
    customers,
    settings,
    adminUser,
    logoutAdmin,
    softDeleteProduct,
    restoreProduct,
    permanentlyDeleteProduct,
    emptyTrash,
    reorderProducts,
    moveProduct,
    changeProductOrder,
    updateOrderStatus,
    archiveOrder,
    restoreOrder,
    permanentlyDeleteOrder,
    updateSettings,
    exportBooksToCSV,
    exportOrdersToCSV,
    exportCustomersToCSV,
    backupAllDataJSON,
    restoreDataFromJSON,
    isSupabaseLive,
    freeTierUsage,
    refreshData
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'books' | 'orders' | 'customers' | 'trash' | 'settings' | 'backup' | 'supabase'
  >('overview');

  // Book edit state
  const [editingBook, setEditingBook] = useState<Product | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  const handleMoveUp = async (id: string) => {
    await moveProduct(id, 'up');
    setReorderNotification('বইটির সিরিয়াল উপরে সরানো হয়েছে!');
    setTimeout(() => setReorderNotification(null), 2500);
  };

  const handleMoveDown = async (id: string) => {
    await moveProduct(id, 'down');
    setReorderNotification('বইটির সিরিয়াল নিচে নামানো হয়েছে!');
    setTimeout(() => setReorderNotification(null), 2500);
  };

  const handleDirectOrder = async (id: string, targetOrder: number) => {
    await changeProductOrder(id, targetOrder);
    setReorderNotification(`বইটিকে #${toBengaliDigits(targetOrder)} সিরিয়ালে নির্ধারণ করা হয়েছে!`);
    setTimeout(() => setReorderNotification(null), 2500);
  };

  // Search & Filters
  const [bookSearch, setBookSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Confirmation modal for deletion
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    onConfirm: () => {}
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Supabase Custom Config Form
  const storedConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(storedConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(storedConfig.key);
  const [supabaseSaved, setSupabaseSaved] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Restore JSON upload ref
  const restoreFileRef = React.useRef<HTMLInputElement>(null);

  // Top Metrics Calculation
  const metrics = useMemo(() => {
    const totalBooks = products.filter((p) => !p.deleted_at).length;
    const totalOrders = orders.length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr)).length;

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    const totalSales = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const lowStockBooks = products.filter((p) => !p.deleted_at && p.stock <= 10);

    return {
      totalBooks,
      totalOrders,
      todayOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
      lowStockBooks
    };
  }, [products, orders]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return products
      .filter((p) => !p.deleted_at)
      .filter(
        (p) =>
          p.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
          (p.bangla_title && p.bangla_title.includes(bookSearch))
      )
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [products, bookSearch]);

  const totalBooksCount = useMemo(() => {
    return products.filter((p) => !p.deleted_at).length;
  }, [products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phone.includes(orderSearch);
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        c.district.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSupabaseSaved(true);
    refreshData();
    setTimeout(() => setSupabaseSaved(false), 2500);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const handleJSONFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await restoreDataFromJSON(content);
      alert(res.message);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#064E3B] text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={settings.logo || '/logo.png'}
            alt="MEDI Nursing Logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37] shadow-md bg-white shrink-0"
          />
          <div>
            <h1 className="text-base sm:text-lg font-black leading-tight flex items-center gap-2">
              <span>মেডি নার্সিং এডমিন প্যানেল</span>
              <span className="text-[10px] bg-emerald-800 border border-emerald-600 px-2 py-0.5 rounded-full font-bold text-amber-300">
                Jessore HQ
              </span>
            </h1>
            <p className="text-[11px] text-emerald-200">
              অ্যাডমিন: <span className="font-semibold text-white">{adminUser?.full_name || 'পরিচালক'}</span> ({adminUser?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Storage & DB Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-slate-200 font-medium">
              {isSupabaseLive ? 'সুপাবেস লাইভ সিঙ্ক' : 'অফলাইন ও লোকাল স্টোরেজ'}
            </span>
          </div>

          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">ওয়েবসাইট দেখুন</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 border border-rose-700/50 text-xs font-bold transition-all flex items-center gap-1.5 text-rose-200"
            title="লগআউট"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </header>

      {/* Free Tier Limit Warning Banner (Prompt requirement) */}
      {freeTierUsage.isNearLimit && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>সতর্কতা: ফ্রি প্ল্যানের ডাটাবেজ সীমা কাছাকাছি পৌঁছাচ্ছে। ব্যাকআপ সেকশন থেকে ডাটা এক্সপোর্ট করে সংরক্ষণ করুন।</span>
          </div>
        </div>
      )}

      {/* Admin Layout with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-300">
          {[
            { id: 'overview', label: '📊 ড্যাশবোর্ড', icon: LayoutDashboard },
            { id: 'books', label: `📚 বই ব্যবস্থাপনা (${metrics.totalBooks})`, icon: BookOpen },
            { id: 'orders', label: `📦 অর্ডারসমূহ (${metrics.totalOrders})`, icon: ShoppingBag },
            { id: 'customers', label: `👥 গ্রাহক তালিকা (${customers.length})`, icon: Users },
            { id: 'trash', label: `🗑️ ট্র্যাশ (${trashProducts.length})`, icon: Trash2 },
            { id: 'settings', label: '⚙️ সাইট সেটিংস', icon: Settings },
            { id: 'backup', label: '💾 ব্যাকআপ ও এক্সপোর্ট', icon: Database },
            { id: 'supabase', label: '⚡ সুপাবেস ও হোস্টিং', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#064E3B] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>মোট বিক্রয় (বিক্রিত মূল্য)</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-[#064E3B]">৳{metrics.totalSales}</div>
                <p className="text-[11px] text-slate-400">ক্যান্সেল অর্ডার বাদে মোট রেভিনিউ</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>সর্বমোট অর্ডার</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{toBengaliDigits(metrics.totalOrders)} টি</div>
                <p className="text-[11px] text-emerald-700 font-semibold">আজকের অর্ডার: {toBengaliDigits(metrics.todayOrders)} টি</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>পেন্ডিং অর্ডার (Pending)</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{toBengaliDigits(metrics.pendingOrders)} টি</div>
                <p className="text-[11px] text-slate-400">কনফার্মেশনের অপেক্ষায় রয়েছে</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>ডেলিভার্ড অর্ডার</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">{toBengaliDigits(metrics.deliveredOrders)} টি</div>
                <p className="text-[11px] text-slate-400">সফলভাবে পৌঁছেছে</p>
              </div>
            </div>

            {/* Low stock alerts if any */}
            {metrics.lowStockBooks.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>সীমিত স্টক সতর্কতা (Low Stock Alert):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {metrics.lowStockBooks.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-white border border-amber-300 flex items-center justify-between text-xs">
                      <span className="font-bold truncate max-w-[200px]">{b.title}</span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                        বাকি: {toBengaliDigits(b.stock)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Quick Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <span>সাম্প্রতিক অর্ডারসমূহ</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#064E3B] hover:underline"
                >
                  সব অর্ডার দেখুন ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">এখনও কোনো অর্ডার পাওয়া যায়নি।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                        <th className="py-2.5 px-3">অর্ডার আইডি</th>
                        <th className="py-2.5 px-3">গ্রাহক</th>
                        <th className="py-2.5 px-3">মোবাইল</th>
                        <th className="py-2.5 px-3">জেলা</th>
                        <th className="py-2.5 px-3">মোট বিল</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                        <th className="py-2.5 px-3 text-right">একশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                          <td className="py-3 px-3 font-medium">{o.customer_name}</td>
                          <td className="py-3 px-3 font-mono">{o.phone}</td>
                          <td className="py-3 px-3">{o.district}</td>
                          <td className="py-3 px-3 font-bold text-[#064E3B]">৳{o.total}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                o.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'delivered'
                                  ? 'bg-blue-100 text-blue-800'
                                  : o.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => onPrintInvoice(o)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                              title="চালান প্রিন্ট"
                            >
                              ইনভয়েস
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOK MANAGEMENT */}
        {activeTab === 'books' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Reorder Notification Toast */}
            {reorderNotification && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#064E3B] text-white text-xs font-bold flex items-center justify-between shadow-lg border border-emerald-500 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{reorderNotification}</span>
                </div>
                <span className="text-[10px] text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">পাবলিক পেজে লাইভ আপডেট</span>
              </div>
            )}

            {/* Serial Order Visual Guidance Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/70 border border-emerald-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#064E3B] text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-2">
                    <span>বইয়ের সিরিয়াল ও ডিসপ্লে সিকোয়েন্স</span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-md">স্বয়ংক্রিয় সংরক্ষণ</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    আপনি এখানে বইগুলো যেভাবে সাজাবেন (<strong>↑ উপরে</strong> ও <strong>↓ নিচে</strong> বাটনে চেপে অথবা <strong>#সিরিয়াল</strong> নির্বাচন করে), সাধারণ গ্রাহকদের জন্য পাবলিক ওয়েবসাইটে (হোমপেজ ও বইয়ের তালিকা) ঠিক সেই সিরিয়াল অনুযায়ী ১, ২, ৩... সাজানো অবস্থায় প্রদর্শিত হবে।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-[#064E3B] shadow-2xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>মোট বই: {toBengaliDigits(filteredBooks.length)}টি</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="relative flex-1 max-w-md w-full">
                <input
                  type="text"
                  placeholder="বইয়ের নাম দিয়ে খুঁজুন..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportBooksToCSV}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>CSV এক্সপোর্ট</span>
                </button>

                <button
                  onClick={() => {
                    setEditingBook(null);
                    setIsBookModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন বই যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3 px-4 whitespace-nowrap">সিরিয়াল / ক্রম</th>
                      <th className="py-3 px-4">কভার</th>
                      <th className="py-3 px-4">বইয়ের নাম</th>
                      <th className="py-3 px-4">রেগুলার মূল্য</th>
                      <th className="py-3 px-4">অফার মূল্য</th>
                      <th className="py-3 px-4">ছাড়</th>
                      <th className="py-3 px-4">স্টক</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.map((b, index) => {
                      const discount = calculateDiscountPercent(b.regular_price, b.offer_price);
                      const isFirst = index === 0;
                      const isLast = index === filteredBooks.length - 1;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Serial Order Controls */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-xl border border-slate-200/80 w-fit">
                              {/* Serial Number Badge */}
                              <div
                                className="w-7 h-7 rounded-lg bg-[#064E3B] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                                title={`বর্তমান সিরিয়াল নম্বর: #${toBengaliDigits(b.sort_order)}`}
                              >
                                {toBengaliDigits(b.sort_order)}
                              </div>

                              {/* Up / Down Reorder Arrows */}
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveUp(b.id)}
                                  disabled={isFirst}
                                  title="উপরে নিন (সিরিয়ালে এগিয়ে আনুন)"
                                  className={`w-6 h-3.5 rounded flex items-center justify-center transition-colors ${
                                    isFirst
                                      ? 'text-slate-300 cursor-not-allowed bg-slate-100/60'
                                      : 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-95 cursor-pointer'
                                  }`}
                                >
                                  <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveDown(b.id)}
                                  disabled={isLast}
                                  title="নিচে নিন (সিরিয়ালে পিছিয়ে দিন)"
                                  className={`w-6 h-3.5 rounded flex items-center justify-center transition-colors ${
                                    isLast
                                      ? 'text-slate-300 cursor-not-allowed bg-slate-100/60'
                                      : 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-95 cursor-pointer'
                                  }`}
                                >
                                  <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                                </button>
                              </div>

                              {/* Direct Position Dropdown */}
                              <select
                                value={b.sort_order}
                                onChange={(e) => handleDirectOrder(b.id, Number(e.target.value))}
                                title="সরাসরি সিরিয়াল ক্রম নির্বাচন করুন"
                                className="text-[11px] font-bold text-[#064E3B] bg-white border border-slate-300 hover:border-emerald-500 rounded-md px-1.5 py-0.5 outline-hidden cursor-pointer"
                              >
                                {Array.from({ length: totalBooksCount }, (_, i) => i + 1).map((num) => (
                                  <option key={num} value={num}>
                                    #{toBengaliDigits(num)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Cover Image */}
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-100 border border-slate-200 p-0.5 shadow-2xs">
                              <img src={b.cover_image} alt={b.title} className="w-full h-full object-contain" />
                            </div>
                          </td>

                          {/* Title */}
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-slate-900 block max-w-xs">{b.title}</span>
                            <span className="text-[10px] text-slate-400">{b.edition || 'সংস্করণ ২০২৬'}</span>
                          </td>

                          {/* Regular Price */}
                          <td className="py-2.5 px-4 font-mono text-slate-400 line-through">৳{b.regular_price}</td>

                          {/* Offer Price */}
                          <td className="py-2.5 px-4 font-mono font-bold text-emerald-800">৳{b.offer_price}</td>

                          {/* Discount */}
                          <td className="py-2.5 px-4">
                            {discount > 0 ? (
                              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[10px]">
                                {discount}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                b.stock <= 5
                                  ? 'bg-red-100 text-red-800'
                                  : b.stock <= 15
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {toBengaliDigits(b.stock)} কপি
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {b.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingBook(b);
                                setIsBookModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] font-bold cursor-pointer"
                            >
                              সম্পাদনা
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteModal({
                                  isOpen: true,
                                  title: `"${b.title}" বইটি ট্র্যাশে সরাতে চান?`,
                                  onConfirm: () => softDeleteProduct(b.id)
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold cursor-pointer"
                            >
                              ডিলিট
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative flex-1 max-w-md w-full">
                <input
                  type="text"
                  placeholder="অর্ডার নং, নাম বা মোবাইল দিয়ে খুঁজুন..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-700"
                >
                  <option value="all">সব স্ট্যাটাস ({orders.length})</option>
                  <option value="pending">পেন্ডিং ({metrics.pendingOrders})</option>
                  <option value="confirmed">কনফার্মড ({metrics.confirmedOrders})</option>
                  <option value="processing">প্রসেসিং</option>
                  <option value="shipped">শিপড</option>
                  <option value="delivered">ডেলিভার্ড ({metrics.deliveredOrders})</option>
                  <option value="cancelled">ক্যান্সেলড ({metrics.cancelledOrders})</option>
                </select>

                <button
                  onClick={exportOrdersToCSV}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>অর্ডার CSV</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3 px-3">অর্ডার নং</th>
                      <th className="py-3 px-3">তারিখ</th>
                      <th className="py-3 px-3">গ্রাহকের নাম ও ফোন</th>
                      <th className="py-3 px-3">ঠিকানা</th>
                      <th className="py-3 px-3">বইয়ের বিবরণ</th>
                      <th className="py-3 px-3">মোট বিল</th>
                      <th className="py-3 px-3">স্ট্যাটাস পরিবর্তন</th>
                      <th className="py-3 px-3 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          কোনো অর্ডার পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                          <td className="py-3 px-3 text-[11px] text-slate-500">
                            {new Date(o.created_at).toLocaleDateString('bn-BD')}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{o.customer_name}</span>
                            <span className="font-mono text-emerald-700 text-[11px]">{o.phone}</span>
                          </td>
                          <td className="py-3 px-3 max-w-xs text-[11px] text-slate-600">
                            <p className="truncate">{o.address}</p>
                            <p className="font-semibold text-slate-800">{o.upazila}, {o.district}</p>
                          </td>
                          <td className="py-3 px-3 max-w-xs text-[11px]">
                            {o.items.map((i, idx) => (
                              <p key={idx} className="truncate">
                                • {i.product_title} × {toBengaliDigits(i.quantity)}
                              </p>
                            ))}
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-[#064E3B]">
                            ৳{o.total}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold outline-hidden ${
                                o.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : o.status === 'delivered'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : o.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              <option value="pending">পেন্ডিং (Pending)</option>
                              <option value="confirmed">কনফার্মড (Confirmed)</option>
                              <option value="processing">প্রসেসিং (Processing)</option>
                              <option value="shipped">শিপড (Shipped)</option>
                              <option value="delivered">ডেলিভার্ড (Delivered)</option>
                              <option value="cancelled">ক্যান্সেলড (Cancelled)</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => onPrintInvoice(o)}
                              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                              title="ইনভয়েস প্রিন্ট"
                            >
                              প্রিন্ট
                            </button>
                            <button
                              onClick={() => archiveOrder(o.id)}
                              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                              title="আর্কাইভ"
                            >
                              আর্কাইভ
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteModal({
                                  isOpen: true,
                                  title: `অর্ডার ${o.order_number} স্থায়ীভাবে ডিলিট করতে চান?`,
                                  onConfirm: () => permanentlyDeleteOrder(o.id)
                                });
                              }}
                              className="px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-medium"
                              title="ডিলিট"
                            >
                              ডিলিট
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative flex-1 max-w-md w-full">
                <input
                  type="text"
                  placeholder="গ্রাহকের নাম, মোবাইল বা জেলা দিয়ে খুঁজুন..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <button
                onClick={exportCustomersToCSV}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>গ্রাহক ডাটা CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3 px-4">গ্রাহকের নাম</th>
                      <th className="py-3 px-4">মোবাইল নম্বর</th>
                      <th className="py-3 px-4">জেলা</th>
                      <th className="py-3 px-4">মোট অর্ডার</th>
                      <th className="py-3 px-4">সর্বমোট ক্রয় (টাকা)</th>
                      <th className="py-3 px-4">সর্বশেষ অর্ডার</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          কোনো গ্রাহক পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c) => (
                        <tr key={c.phone} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{c.customer_name}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-800">{c.phone}</td>
                          <td className="py-3 px-4">{c.district}</td>
                          <td className="py-3 px-4 font-bold">{toBengaliDigits(c.total_orders)} টি</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#064E3B]">৳{c.total_spent}</td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(c.last_order_date).toLocaleDateString('bn-BD')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TRASH & RESTORE */}
        {activeTab === 'trash' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-amber-700" />
                  <span>ট্র্যাশ বিন (সফট ডিলিট করা রেকর্ডসমূহ)</span>
                </h3>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  এখানে রাখা বইগুলো পাবলিক সাইট থেকে লুকায়িত থাকবে। আপনি চাইলে আবার রিস্টোর করতে পারেন।
                </p>
              </div>

              {trashProducts.length > 0 && (
                <button
                  onClick={() => {
                    setConfirmDeleteModal({
                      isOpen: true,
                      title: 'আপনি কি নিশ্চিতভাবে ট্র্যাশ খালি করতে চান? এটি চিরতরে মুছে ফেলবে।',
                      onConfirm: emptyTrash
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  ট্র্যাশ খালি করুন (Empty Trash)
                </button>
              )}
            </div>

            {trashProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-slate-200">
                <Trash2 className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">ট্র্যাশ বিনে বর্তমানে কোনো বই নেই।</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3 px-4">কভার</th>
                      <th className="py-3 px-4">বইয়ের নাম</th>
                      <th className="py-3 px-4">মূল্য</th>
                      <th className="py-3 px-4">মুছে ফেলার তারিখ</th>
                      <th className="py-3 px-4 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trashProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-4">
                          <div className="w-9 h-12 rounded-sm overflow-hidden bg-slate-100 p-0.5">
                            <img src={p.cover_image} alt={p.title} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{p.title}</td>
                        <td className="py-2.5 px-4 font-mono font-bold">৳{p.offer_price}</td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {p.deleted_at ? new Date(p.deleted_at).toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => restoreProduct(p.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold"
                          >
                            রিস্টোর করুন
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteModal({
                                isOpen: true,
                                title: `আপনি কি নিশ্চিতভাবে এই তথ্যটি ডিলিট করতে চান?`,
                                onConfirm: () => permanentlyDeleteProduct(p.id)
                              });
                            }}
                            className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold"
                          >
                            স্থায়ীভাবে মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-700" />
                <span>সাইট সেটিংস ও ডেলিভারি চার্জ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                এখানে যে কোনো পরিবর্তন করলে তা স্বয়ংক্রিয়ভাবে পাবলিক ওয়েবসাইটে সাথে সাথে আপডেট হয়ে যাবে।
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ওয়েবসাইটের নাম</label>
                  <input
                    type="text"
                    value={settingsForm.website_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, website_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Delivery Charges (Prompt requirement 11) */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                  🚚 ডেলিভারি চার্জ সেটিংস (ক্যাশ অন ডেলিভারি)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      যশোর সদর / জেলা ডেলিভারি চার্জ (টাকা)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.delivery_charge_jessore}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, delivery_charge_jessore: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      যশোরের বাইরে (সারা বাংলাদেশ) চার্জ (টাকা)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.delivery_charge_outside}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, delivery_charge_outside: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp & Hotline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    হোয়াটসঅ্যাপ অর্ডার নম্বর (লোকাল)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    হোয়াটসঅ্যাপ আন্তর্জাতিক কোড সহ (wa.me)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp_international}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_international: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">যশোর কোচিং শাখার ঠিকানা</label>
                <input
                  type="text"
                  value={settingsForm.address_text}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                  🔗 সোশ্যাল মিডিয়া ও প্রকাশনা লিংকসমূহ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facebook Page Link</label>
                    <input
                      type="url"
                      value={settingsForm.facebook_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">YouTube Channel Link</label>
                    <input
                      type="url"
                      value={settingsForm.youtube_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, youtube_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Azaan Publication Page Link</label>
                    <input
                      type="url"
                      value={settingsForm.azaan_publication_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, azaan_publication_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">টপ অ্যানাউন্সমেন্ট ব্যানার লেখা</label>
                <input
                  type="text"
                  value={settingsForm.notice_text}
                  onChange={(e) => setSettingsForm({ ...settingsForm, notice_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-md"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: BACKUP & EXPORT */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Exports Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>এক্সেল ও সিএসভি এক্সপোর্ট (CSV Export)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  আপনার বই, অর্ডার ও গ্রাহকদের বিস্তারিত তালিকা এক্সেল ফাইলে ডাউনলোড করে অফলাইনে সংরক্ষণ বা প্রিন্ট করুন।
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={exportBooksToCSV}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between"
                  >
                    <span>সকল বইয়ের তালিকা ডাউনলোড (Books CSV)</span>
                    <Download className="w-4 h-4 text-emerald-700" />
                  </button>

                  <button
                    onClick={exportOrdersToCSV}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between"
                  >
                    <span>সকল অর্ডারের হিস্টোরি ডাউনলোড (Orders CSV)</span>
                    <Download className="w-4 h-4 text-emerald-700" />
                  </button>

                  <button
                    onClick={exportCustomersToCSV}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between"
                  >
                    <span>গ্রাহকদের তালিকা ডাউনলোড (Customers CSV)</span>
                    <Download className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>
              </div>

              {/* Complete Database JSON Backup & Restore Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Database className="w-5 h-5 text-emerald-700" />
                  <span>পূর্ণাঙ্গ ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  বইয়ের তথ্য, কভার লিংক, সকল অর্ডার এবং সেটিংস সহ সম্পূর্ণ ডাটাবেজ এক ক্লিকে ব্যাকআপ ফাইল হিসেবে ডাউনলোড করুন।
                </p>

                <div className="pt-2 space-y-3">
                  <button
                    onClick={backupAllDataJSON}
                    className="w-full py-3 px-4 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>পূর্ণাঙ্গ JSON ব্যাকআপ ডাউনলোড করুন</span>
                  </button>

                  <div>
                    <input
                      ref={restoreFileRef}
                      type="file"
                      accept=".json"
                      onChange={handleJSONFileRestore}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => restoreFileRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>পূর্বের JSON ব্যাকআপ রিস্টোর করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SUPABASE & HOSTING GUIDE */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Supabase Connection Setup Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-700" />
                    <span>সুপাবেস (Supabase 100% Free Tier) সংযোগ</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আপনার নিজস্ব Supabase প্রজেক্টের URL এবং Anon Key এখানে দিয়ে দিলে অ্যাপটি স্বয়ংক্রিয়ভাবে রিমোট ক্লাউড ডাটাবেজ ও রিয়েলটাইমে কানেক্ট হয়ে যাবে।
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isSupabaseLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                  <span>{isSupabaseLive ? 'সুপাবেস সক্রিয়' : 'লোকাল মেমোরি মোড'}</span>
                </div>
              </div>

              {supabaseSaved && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>সুপাবেস কনফিগারেশন আপডেট হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs"
                  >
                    সংযোগ যাচাই ও সংরক্ষণ
                  </button>
                </div>
              </form>
            </div>

            {/* SQL Script Viewer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-slate-200 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>Supabase SQL Schema & RLS Policies (1-Click Setup)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supabase Dashboard-এর SQL Editor-এ গিয়ে নিচের কোডটি পেস্ট করে "RUN" চাপুন।
                  </p>
                </div>

                <button
                  onClick={handleCopySQL}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#064E3B] font-extrabold text-xs flex items-center gap-1.5 transition-all"
                >
                  {sqlCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SQL কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>সম্পূর্ণ SQL কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/50 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72 border border-slate-700/80 leading-relaxed">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>

            {/* Free Netlify & GitHub Instructions */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>১০০% ফ্রি হোস্টিং ও ডিপ্লয়মেন্ট নির্দেশিকা:</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <span className="font-bold text-slate-800">Netlify Free Plan:</span> GitHub রিপোজিটরি কানেক্ট করে <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">npm run build</code> এবং publish directory হিসেবে <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">dist</code> নির্বাচন করুন।
                </li>
                <li>
                  <span className="font-bold text-slate-800">বিনামূল্যে কাস্টম সাবডোমেন:</span> Netlify সাইট সেটিংসে গিয়ে <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">medi-nursing-books.netlify.app</code> নাম সিলেক্ট করতে পারেন।
                </li>
                <li>
                  <span className="font-bold text-slate-800">জিরো খরচ নিশ্চয়তা:</span> Supabase Free Tier + Netlify Free Tier এ কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      {isBookModalOpen && (
        <BookFormModal
          book={editingBook}
          onClose={() => {
            setIsBookModalOpen(false);
            setEditingBook(null);
          }}
          onSaved={() => {
            setIsBookModalOpen(false);
            setEditingBook(null);
          }}
        />
      )}

      {/* Confirmation Modal (Prompt requirement: "আপনি কি নিশ্চিতভাবে এই তথ্যটি ডিলিট করতে চান?") */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                আপনি কি নিশ্চিতভাবে এই তথ্যটি ডিলিট করতে চান?
              </h4>
              <p className="text-xs text-slate-500">{confirmDeleteModal.title}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteModal({ isOpen: false, title: '', onConfirm: () => {} })}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                বাতিল (Cancel)
              </button>
              <button
                onClick={() => {
                  confirmDeleteModal.onConfirm();
                  setConfirmDeleteModal({ isOpen: false, title: '', onConfirm: () => {} });
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                কনফার্ম ডিলিট (Confirm Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
