import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { calculateDiscountPercent, toBengaliDigits } from '../utils/orderUtils';
import { ShoppingCart, Zap, Eye, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface BookCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ product, onOpenDetails, onBuyNow }) => {
  const { addToCart } = useStore();
  const discount = calculateDiscountPercent(product.regular_price, product.offer_price);

  const getStockBadge = () => {
    if (product.stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> স্টক আউট
        </span>
      );
    }
    if (product.stock <= 10) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> মাত্র {toBengaliDigits(product.stock)} কপি বাকি
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> স্টকে আছে
      </span>
    );
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs shadow-md">
            -{toBengaliDigits(discount)}% ছাড়
          </span>
        </div>
      )}

      {/* Category / Edition Tag */}
      {product.edition && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium">
            {product.edition}
          </span>
        </div>
      )}

      {/* Book Cover Image Container */}
      <div
        onClick={() => onOpenDetails(product)}
        className="w-full aspect-3/4 bg-slate-100 relative overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity p-4 flex items-center justify-center"
      >
        <img
          src={product.cover_image}
          alt={product.title}
          className="w-full h-full object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Quick View Overlay on hover */}
        <div className="absolute inset-0 bg-[#064E3B]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="px-4 py-2 rounded-xl bg-white text-[#064E3B] font-bold text-xs shadow-lg flex items-center gap-1.5 hover:bg-amber-50"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>বিস্তারিত দেখুন</span>
          </button>
        </div>
      </div>

      {/* Book Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {getStockBadge()}
            {product.pages && (
              <span className="text-[11px] text-slate-500 font-medium">
                {toBengaliDigits(product.pages)} পৃষ্ঠা
              </span>
            )}
          </div>

          <h3
            onClick={() => onOpenDetails(product)}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#064E3B] transition-colors cursor-pointer line-clamp-1 leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-[#064E3B]">
              ৳{product.offer_price}
            </span>
            {product.regular_price > product.offer_price && (
              <span className="text-xs sm:text-sm text-slate-400 line-through">
                ৳{product.regular_price}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={product.stock <= 0}
              className="w-full py-2 sm:py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>কার্টে যোগ</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              disabled={product.stock <= 0}
              className="w-full py-2 sm:py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#047857] to-[#064E3B] hover:from-[#064E3B] hover:to-[#047857] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>এখনই কিনুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
