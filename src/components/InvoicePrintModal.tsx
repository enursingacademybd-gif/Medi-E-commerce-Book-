import React from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { toBengaliDigits } from '../utils/orderUtils';
import { X, Printer, Download, CheckCircle, Shield } from 'lucide-react';

interface InvoicePrintModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl relative border border-slate-300">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#047857]" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">অর্ডার চালান / মেমো প্রিভিউ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Section */}
        <div id="invoice-printable" className="p-4 sm:p-6 bg-white text-slate-800 space-y-6 border border-slate-200 rounded-xl">
          {/* Organization & Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b-2 border-emerald-800 gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={settings.logo || '/logo.png'}
                alt="MEDI Nursing Logo"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37] shrink-0 bg-white"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#064E3B] tracking-tight">
                  {settings.website_name}
                </h1>
                <p className="text-xs font-bold text-amber-700">
                  MEDI Nursing Admission Coaching, Jessore
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                  {settings.address_text}
                </p>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  হটলাইন: {settings.contact_phone} • হোয়াটসঅ্যাপ: {settings.whatsapp_number}
                </p>
              </div>
            </div>
            <div className="text-right sm:text-right w-full sm:w-auto">
              <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-[#064E3B] text-xs font-extrabold uppercase">
                ক্যাশ মেমো / ইনভয়েস
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                নং: {order.order_number}
              </p>
              <p className="text-[11px] text-slate-500">
                তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px]">গ্রাহকের নাম:</span>
              <span className="font-bold text-slate-900 text-sm">{order.customer_name}</span>
              <p className="mt-1 font-mono">{order.phone}</p>
              {order.alternate_phone && <p className="text-[10px] text-slate-500 font-mono">বিকল্প: {order.alternate_phone}</p>}
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px]">ডেলিভারি ঠিকানা:</span>
              <p className="font-medium">{order.address}</p>
              <p className="text-slate-600">{order.upazila}, {order.district}</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                {order.status === 'confirmed' ? 'কনফার্মড' : order.status === 'delivered' ? 'ডেলিভার্ড' : 'পেন্ডিং অর্ডার'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-bold">
                  <th className="py-2 px-2">ক্র নং</th>
                  <th className="py-2 px-2">বইয়ের নাম ও বিবরণ</th>
                  <th className="py-2 px-2 text-center">পরিমাণ</th>
                  <th className="py-2 px-2 text-right">একক মূল্য</th>
                  <th className="py-2 px-2 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="py-2.5 px-2">{toBengaliDigits(idx + 1)}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-900">{item.product_title}</td>
                    <td className="py-2.5 px-2 text-center font-bold">{toBengaliDigits(item.quantity)}</td>
                    <td className="py-2.5 px-2 text-right font-mono">৳{item.unit_price}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold">৳{item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Total Summary */}
          <div className="pt-2 border-t-2 border-slate-300 flex justify-end">
            <div className="w-56 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>উপ-মোট (Subtotal):</span>
                <span className="font-mono font-bold">৳{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono font-bold">৳{order.delivery_charge}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-300 flex justify-between font-black text-sm text-slate-900">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-[#064E3B] font-mono">৳{order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer note & Stamp */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">শর্তাবলী:</p>
              <p>১. পার্সেল গ্রহণের সময় মূল্য পরিশোধ করুন (ক্যাশ অন ডেলিভারি)।</p>
              <p>২. বইয়ের কোনো পৃষ্ঠায় প্রিন্টিং ত্রুটি থাকলে ৭ দিনের মধ্যে পরিবর্তনযোগ্য।</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="font-bold text-slate-700">কর্তৃপক্ষের স্বাক্ষর</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
