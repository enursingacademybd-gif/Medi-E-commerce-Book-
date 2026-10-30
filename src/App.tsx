import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BookCard } from './components/BookCard';
import { BookDetailsModal } from './components/BookDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { WhyChooseSection } from './components/WhyChooseSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { Product, Order } from './types';
import { toBengaliDigits } from './utils/orderUtils';
import { BookOpen, Search, Filter, Sparkles, Phone, MessageSquare, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

function MainStoreContent() {
  const { activeProducts, settings, isAdmin, addToCart } = useStore();

  // Navigation view: 'home' | 'books' | 'about' | 'contact' | 'checkout' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'books' | 'about' | 'contact' | 'checkout' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Modals
  const [selectedBook, setSelectedBook] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successfulOrder, setSuccessfulOrder] = useState<Order | null>(null);
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null);

  // Books page filter & search
  const [bookCategory, setBookCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

  // Filtered books
  const displayBooks = activeProducts
    .filter((book) => {
      const matchesCategory = bookCategory === 'all' || book.category === bookCategory;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.bangla_title && book.bangla_title.includes(searchQuery)) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.offer_price - b.offer_price;
      if (sortBy === 'price-high') return b.offer_price - a.offer_price;
      return (a.sort_order ?? 999) - (b.sort_order ?? 999);
    });

  const handleOpenBookDetails = (product: Product) => {
    setSelectedBook(product);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
    setSelectedBook(null);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setSuccessfulOrder(order);
    setCurrentView('home');
  };

  const categories = [
    { id: 'all', label: `সব বই (${activeProducts.length})` },
    { id: 'common', label: 'কমন গাইড' },
    { id: 'bsc', label: 'বিএসসি ইন নার্সিং' },
    { id: 'diploma', label: 'ডিপ্লোমা ও মিডওয়াইফারি' },
    { id: 'question_bank', label: 'প্রশ্নব্যাংক' }
  ];

  // If in Admin view
  if (currentView === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-slate-100 py-10">
          <AdminLogin
            onSuccess={() => {}}
            onCancel={() => setCurrentView('home')}
          />
        </div>
      );
    }
    return (
      <AdminDashboard
        onBackToStore={() => setCurrentView('home')}
        onPrintInvoice={(order) => setPrintableOrder(order)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentView === 'checkout' ? (
          <CheckoutView
            onBack={() => setCurrentView('home')}
            onOrderSuccess={handleOrderSuccess}
          />
        ) : currentView === 'about' ? (
          <div>
            <div className="bg-[#064E3B] text-white py-12 px-4 text-center">
              <h1 className="text-3xl font-black">কেন মেডি নার্সিং ভর্তি কোচিং যশোর?</h1>
              <p className="text-emerald-200 mt-2 text-sm max-w-xl mx-auto">
                স্বপ্ন তোমার, দায়িত্ব আমাদের — দীর্ঘদিনের অভিজ্ঞতায় পরিচালিত যশোরের শীর্ষ নার্সিং ভর্তি কোচিং
              </p>
            </div>
            <WhyChooseSection />
            <TestimonialsSection />
            <ContactSection />
          </div>
        ) : currentView === 'contact' ? (
          <div>
            <div className="bg-[#064E3B] text-white py-12 px-4 text-center">
              <h1 className="text-3xl font-black">যোগাযোগ ও যশোর শাখা</h1>
              <p className="text-emerald-200 mt-2 text-sm max-w-xl mx-auto">
                সরাসরি বই সংগ্রহ, ভর্তি পরামর্শ বা ডেলিভারি তথ্যের জন্য যোগাযোগ করুন
              </p>
            </div>
            <ContactSection />
          </div>
        ) : currentView === 'books' ? (
          /* ALL BOOKS VIEW */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                ৯টি মূল প্রকাশনা
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                মেডি নার্সিং ভর্তি সহায়িকা বইসমূহ
              </h1>
              <p className="text-sm text-slate-600">
                বিএসসি ইন নার্সিং, ডিপ্লোমা ইন নার্সিং সায়েন্স এবং ডিপ্লোমা ইন মিডওয়াইফারি ভর্তি প্রস্তুতির সর্বাধুনিক বই
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                {/* Search */}
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="বইয়ের নাম দিয়ে খুঁজুন (যেমন: গাইড, প্রশ্নব্যাংক, বায়োলজি)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">সাজান:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-700 outline-hidden"
                  >
                    <option value="default">প্রস্তাবিত ক্রম (Default)</option>
                    <option value="price-low">মূল্য: কম থেকে বেশি</option>
                    <option value="price-high">মূল্য: বেশি থেকে কম</option>
                  </select>
                </div>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setBookCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      bookCategory === cat.id
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Books Grid */}
            {displayBooks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
                <BookOpen className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-2" />
                <p className="font-bold">আপনার অনুসন্ধানের সাথে কোনো বই মেলেনি।</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setBookCategory('all');
                  }}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold"
                >
                  সব ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayBooks.map((product) => (
                  <BookCard
                    key={product.id}
                    product={product}
                    onOpenDetails={handleOpenBookDetails}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* HOME PAGE */
          <div>
            {/* Hero Banner */}
            <HeroBanner
              onShopNow={() => {
                const booksSection = document.getElementById('featured-books-section');
                if (booksSection) {
                  booksSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('books');
                }
              }}
            />

            {/* 9 Books Showcase Section */}
            <section id="featured-books-section" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#064E3B] text-xs font-extrabold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>মেডি নার্সিং-এর ৯টি বিশেষ বই</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                    ভর্তি প্রস্তুতির সর্বাধিক বিক্রিত বইসমূহ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                    বিএসসি, ডিপ্লোমা ও মিডওয়াইফারি পরীক্ষার শতভাগ কমন উপযোগী নির্ভুল বই। ক্যাশ অন ডেলিভারিতে অর্ডার করুন।
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView('books')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>সব বই একসাথে দেখুন ({activeProducts.length})</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

              {/* Grid of Books */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {activeProducts.slice(0, 9).map((product) => (
                  <BookCard
                    key={product.id}
                    product={product}
                    onOpenDetails={handleOpenBookDetails}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            </section>

            {/* Special Combo Offer Banner */}
            <section className="py-10 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-slate-950">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-wider bg-black/20 text-white px-3 py-1 rounded-full inline-block">
                      সীমিত সময়ের মেগা অফার
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
                      একসাথে ৩টি বা সম্পূর্ণ ৯টি বইয়ের সেট অর্ডারে বিশেষ ছাড়!
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-900 font-semibold">
                      সারাদেশে হোম ডেলিভারি • ওএমআর শিট প্যাক ফ্রি • কুরিয়ার ট্র্যাকিং সুবিধা
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি মেডি নার্সিং এর সম্পূর্ণ ৯টি বইয়ের কম্বো সেট অফার সম্পর্কে জানতে চাই।')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-2xl bg-[#064E3B] hover:bg-[#047857] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shrink-0 transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 text-amber-300" />
                    <span>হোয়াটসঅ্যাপে কম্বো অফার নিন</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Why Choose Section */}
            <WhyChooseSection />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Jessore Coaching Contact */}
            <ContactSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(v) => setCurrentView(v)} />

      {/* Modals */}
      <BookDetailsModal
        product={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBuyNow={(prod, qty) => handleBuyNow(prod, qty)}
        onSelectRelated={(prod) => setSelectedBook(prod)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {successfulOrder && (
        <OrderSuccessModal
          order={successfulOrder}
          onClose={() => setSuccessfulOrder(null)}
          onPrintInvoice={(order) => {
            setSuccessfulOrder(null);
            setPrintableOrder(order);
          }}
        />
      )}

      {printableOrder && (
        <InvoicePrintModal
          order={printableOrder}
          onClose={() => setPrintableOrder(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainStoreContent />
    </StoreProvider>
  );
}
