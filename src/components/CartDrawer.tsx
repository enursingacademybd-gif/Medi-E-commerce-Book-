import React from 'react';
import { useStore } from '../context/StoreContext';
import { toBengaliDigits } from '../utils/orderUtils';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, cartItemCount, settings } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#047857]" />
              <h3 className="font-bold text-slate-800 text-base">
                শপিং কার্ট ({toBengaliDigits(cartItemCount)}টি বই)
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart drawer"
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-[#064E3B]">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">আপনার কার্ট খালি</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    নার্সিং ভর্তি পরীক্ষার প্রয়োজনীয় বইগুলো নির্বাচন করে কার্টে যোগ করুন।
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#064E3B] text-white font-bold text-xs hover:bg-[#047857] transition-all"
                >
                  বইগুলো দেখুন
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 rounded-2xl border border-slate-200/90 hover:border-emerald-300 bg-white shadow-xs flex items-center gap-3 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 p-1 flex items-center justify-center">
                    <img
                      src={item.product.cover_image}
                      alt={item.product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-[#064E3B]">
                        ৳{item.product.offer_price}
                      </span>
                      {item.product.regular_price > item.product.offer_price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ৳{item.product.regular_price}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                          title="কমান"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {toBengaliDigits(item.quantity)}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                          title="বাড়ান"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-slate-700">
                        ৳{item.product.offer_price * item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label={`Remove ${item.product.title} from cart`}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>বইগুলোর মোট মূল্য:</span>
                  <span className="font-bold text-slate-900">৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>যশোরে ৳{settings.delivery_charge_jessore} / বাইরে ৳{settings.delivery_charge_outside}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-sm">আনুমানিক সর্বমোট:</span>
                <span className="font-black text-xl text-[#064E3B]">
                  ৳{cartTotal} <span className="text-xs font-normal text-slate-500">(+ ডেলিভারি)</span>
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#047857] to-[#064E3B] hover:from-[#064E3B] hover:to-[#047857] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ক্যাশ অন ডেলিভারি ও শতভাগ নিরাপদ বুকিং</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
