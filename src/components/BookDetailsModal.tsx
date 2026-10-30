import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { calculateDiscountPercent, toBengaliDigits } from '../utils/orderUtils';
import { X, ShoppingCart, Zap, MessageSquare, Check, ShieldCheck, Truck, BookOpen, Layers } from 'lucide-react';

interface BookDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onSelectRelated: (product: Product) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  product,
  onClose,
  onBuyNow,
  onSelectRelated
}) => {
  const { addToCart, activeProducts, settings } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) return null;

  const discount = calculateDiscountPercent(product.regular_price, product.offer_price);
  const relatedBooks = activeProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#047857]"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {product.edition || 'মেডি নার্সিং প্রকাশনা'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Cover Image */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-xs aspect-3/4 rounded-2xl overflow-hidden shadow-xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-center relative">
                <img
                  src={product.cover_image}
                  alt={product.title}
                  className="w-full h-full object-contain drop-shadow-md"
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md">
                    -{toBengaliDigits(discount)}% ছাড়
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="mt-4 w-full max-w-xs space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#064E3B] font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>১০০% আসল ও নির্ভুল নার্সিং এডমিশন বই</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 font-medium">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>যশোরে ৬০ টাকা, সারা দেশে ১২০ টাকা ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* Right Book Details */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                  {product.title}
                </h2>
                {product.bangla_title && (
                  <p className="text-sm font-semibold text-emerald-800 mt-1">
                    {product.bangla_title}
                  </p>
                )}
              </div>

              {/* Price block */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">অফার মূল্য:</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#064E3B]">৳{product.offer_price}</span>
                    {product.regular_price > product.offer_price && (
                      <span className="text-base text-slate-400 line-through">
                        ৳{product.regular_price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">স্টক পরিস্থিতি:</span>
                  <span
                    className={`text-sm font-bold ${
                      product.stock > 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {product.stock > 0 ? `স্টকে আছে (${toBengaliDigits(product.stock)} কপি)` : 'স্টক শেষ'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#047857]" />
                  <span>বইটির বিবরণ ও বিষয়বস্তু:</span>
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Key Features Bullet Points */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <span>বিশেষ বৈশিষ্ট্যসমূহ:</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Picker & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-700">পরিমাণ:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 hover:bg-slate-100 font-bold text-slate-700 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-sm text-slate-900 min-w-[40px] text-center">
                      {toBengaliDigits(quantity)}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-1.5 hover:bg-slate-100 font-bold text-slate-700 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    মোট: ৳{product.offer_price * quantity}
                  </span>
                </div>

                {/* Primary Purchase Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] font-bold text-sm flex items-center justify-center gap-2 border border-emerald-300 transition-all disabled:opacity-50 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#047857] to-[#064E3B] hover:from-[#064E3B] hover:to-[#047857] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>এখনই অর্ডার করুন (Buy Now)</span>
                  </button>
                </div>

                {/* WhatsApp Enquiry shortcut */}
                <a
                  href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent(`আসসালামু আলাইকুম। আমি "${product.title}" বইটি সম্পর্কে বিস্তারিত জানতে ও অর্ডার করতে চাই।`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>হোয়াটসঅ্যাপে এই বইটি সম্পর্কে প্রশ্ন করুন</span>
                </a>
              </div>
            </div>
          </div>

          {/* Related Books section */}
          {relatedBooks.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>সম্পর্কিত অন্যান্য নার্সিং বই:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedBooks.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-slate-50 flex items-center gap-3 transition-all group"
                  >
                    <div className="w-12 h-16 shrink-0 rounded-md overflow-hidden bg-slate-100 shadow-xs">
                      <img src={rel.cover_image} alt={rel.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                        {rel.title}
                      </h5>
                      <span className="text-xs font-extrabold text-[#064E3B]">৳{rel.offer_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating Toast when added to cart */}
        {addedToast && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#064E3B] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200 z-50">
            <Check className="w-4 h-4 text-amber-400" />
            <span>সফলভাবে কার্টে যোগ হয়েছে!</span>
          </div>
        )}
      </div>
    </div>
  );
};
