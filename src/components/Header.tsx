import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Phone, MessageSquare, BookOpen, ShieldCheck, MapPin, Menu, X, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onNavigate: (view: 'home' | 'books' | 'about' | 'contact' | 'admin') => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onNavigate, currentView }) => {
  const { cartItemCount, settings, isAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'মূল পাতা' },
    { id: 'books', label: 'সকল বই (৯টি)' },
    { id: 'about', label: 'কেন মেডি নার্সিং?' },
    { id: 'contact', label: 'যোগাযোগ ও ব্রাঞ্চ' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#064E3B] text-white text-xs sm:text-sm py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2 text-amber-300 font-medium tracking-wide text-center">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{settings.notice_text || 'মেডি নার্সিং ভর্তি কোচিং যশোর-এর অফিশিয়াল অনলাইন বুক স্টোর'}</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100">
            <a
              href={`tel:${settings.contact_phone}`}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.contact_phone}</span>
            </a>
            <span className="hidden md:inline text-emerald-400/50">|</span>
            <a
              href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent('আসসালামু আলাইকুম, মেডি নার্সিং বই সম্পর্কে জানতে চাই।')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-amber-300 transition-colors font-medium text-amber-300"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">হোয়াটসঅ্যাপ অর্ডার:</span> {settings.whatsapp_number}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 text-left group focus:outline-hidden"
        >
          <img
            src={settings.logo || '/logo.png'}
            alt={settings.website_name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-md group-hover:scale-105 transition-transform bg-white shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#064E3B]">
                {settings.website_name}
              </span>
            </div>
            <p className="text-xs text-amber-700 font-semibold tracking-wide">
              {settings.tagline} • <span className="text-emerald-700">যশোর শাখা</span>
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id as any)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === link.id
                  ? 'bg-emerald-50 text-[#064E3B] font-bold border-b-2 border-[#047857]'
                  : 'text-slate-600 hover:text-[#064E3B] hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
            className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#047857] hover:to-[#064E3B] text-white flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-[#D4AF37] text-[#064E3B] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline">কার্ট</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                currentView === link.id
                  ? 'bg-emerald-50 text-[#064E3B] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{link.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <a
              href={`tel:${settings.contact_phone}`}
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5 py-1"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>কল করুন</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent('আসসালামু আলাইকুম, মেডি নার্সিং বই অর্ডার করতে চাই।')}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-800 flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              হোয়াটসঅ্যাপ
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
