import React, { useState } from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { buildWhatsAppOrderPayload, toBengaliDigits } from '../utils/orderUtils';
import { CheckCircle2, MessageSquare, Copy, Check, Printer, ArrowRight, ShieldCheck, Home } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  onPrintInvoice: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onPrintInvoice
}) => {
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);

  const { messageText, whatsappUrl } = buildWhatsAppOrderPayload(
    order,
    order.items,
    settings
  );

  const handleCopyMessage = () => {
    const fallbackCopy = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = messageText;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.warn('Fallback copy error', err);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(messageText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const handleOpenWhatsApp = () => {
    // Standard safe way to open WhatsApp in new tab or native app
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 space-y-6">
        {/* Success Header Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            আপনার অর্ডারটি আমাদের ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয়েছে। দ্রুত কনফার্মেশন ও ডেলিভারির জন্য নিচে দেওয়া হোয়াটসঅ্যাপ বাটনে চাপুন।
          </p>
        </div>

        {/* Order ID Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="text-amber-800 font-bold block">অর্ডার আইডি:</span>
            <span className="font-mono font-black text-slate-900 text-base">{order.order_number}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#064E3B] text-amber-300 font-bold text-xs">
            পেন্ডিং (ক্যাশ অন ডেলিভারি)
          </span>
        </div>

        {/* Order Details Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[11px]">গ্রাহকের নাম:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">মোবাইল:</span>
              <span className="font-bold">{order.phone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">ডেলিভারি ঠিকানা:</span>
              <span className="font-medium">{order.address}, {order.upazila}, {order.district}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>মোট বইয়ের মূল্য:</span>
              <span className="font-bold">৳{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold">৳{order.delivery_charge}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-base pt-1 border-t border-slate-200">
              <span>সর্বমোট প্রদেয় বিল:</span>
              <span className="text-[#064E3B]">৳{order.total}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Button (Prominent) */}
        <div className="space-y-2.5">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>WhatsApp-এ অর্ডার পাঠান (Send Order)</span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            বাটনে চাপলে হোয়াটসঅ্যাপে মেসেজটি স্বয়ংক্রিয়ভাবে তৈরি হবে, আপনি শুধু সেন্ড (Send) বাটনে চাপবেন।
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Copy Message Fallback */}
          <button
            onClick={handleCopyMessage}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">মেসেজ কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>মেসেজ কপি করুন (Copy Message)</span>
              </>
            )}
          </button>

          {/* Print Invoice */}
          <button
            onClick={() => onPrintInvoice(order)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>প্রিন্ট চালান / মানি রিসিট</span>
          </button>
        </div>

        {/* Back to Home CTA */}
        <div className="pt-2 border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-[#064E3B] flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>মূল পাতায় ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
