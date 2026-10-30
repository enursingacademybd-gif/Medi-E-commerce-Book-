import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BANGLADESH_DISTRICTS, JASHORE_UPAZILAS } from '../data/initialBooks';
import { isValidBDPhone, calculateDeliveryCharge, toBengaliDigits } from '../utils/orderUtils';
import { Order } from '../types';
import { ArrowLeft, ShieldCheck, MapPin, Phone, User, FileText, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

interface CheckoutViewProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBack, onOrderSuccess }) => {
  const { cart, cartTotal, settings, placeOrder } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [district, setDistrict] = useState('Jessore (যশোর)');
  const [upazila, setUpazila] = useState('যশোর সদর (Jessore Sadar)');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate dynamic delivery charge based on district
  const isJessore = district.toLowerCase().includes('jessore') || district.toLowerCase().includes('যশোর');
  const deliveryCharge = isJessore
    ? settings.delivery_charge_jessore
    : settings.delivery_charge_outside;

  const grandTotal = cartTotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('আপনার শপিং কার্ট খালি। অনুগ্রহ করে অন্তত একটি বই নির্বাচন করুন।');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সচল মোবাইল নম্বর লিখুন।');
      return;
    }

    if (!isValidBDPhone(phone.trim())) {
      setErrorMessage('সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01959253030)।');
      return;
    }

    if (alternatePhone && !isValidBDPhone(alternatePhone.trim())) {
      setErrorMessage('বিকল্প নম্বরটি সঠিক ১১ ডিজিটের মোবাইল নম্বর হতে হবে।');
      return;
    }

    if (!district.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।');
      return;
    }

    if (!upazila.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার থানা বা উপজেলা লিখুন।');
      return;
    }

    if (!address.trim() || address.trim().length < 8) {
      setErrorMessage('অনুগ্রহ করে বিস্তারিত সঠিক ডেলিভারি ঠিকানা লিখুন (গ্রাম/মহল্লা, রোড, বাড়ি নম্বর)।');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeOrder({
        customer_name: customerName,
        phone,
        alternate_phone: alternatePhone,
        district,
        upazila,
        address,
        notes,
        delivery_charge: deliveryCharge
      });

      if (!result.success || !result.order) {
        setErrorMessage(result.error || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        setIsSubmitting(false);
        return;
      }

      onOrderSuccess(result.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">আপনার কার্টে কোনো বই নেই</h2>
        <p className="text-sm text-slate-500">অর্ডার করার পূর্বে বই নির্বাচন করে কার্টে যোগ করুন।</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-[#064E3B] text-white font-bold text-sm hover:bg-[#047857]"
        >
          বইয়ের তালিকায় ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#064E3B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>শপিংয়ে ফিরে যান</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Checkout Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#047857]"></span>
              <span>ডেলিভারি ঠিকানা ও তথ্য</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              কুরিয়ার সার্ভিসের মাধ্যমে আপনার ঠিকানায় বই পৌঁছে দেওয়া হবে। ক্যাশ অন ডেলিভারি প্রযোজ্য।
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>আপনার পুরো নাম *</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: তানজিলা আক্তার"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all"
              />
            </div>

            {/* Phone & Alternate Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>মোবাইল নম্বর (১১ ডিজিট) *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01959253030"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</span>
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all"
                />
              </div>
            </div>

            {/* District & Upazila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>জেলা নির্বাচন করুন *</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden bg-white transition-all font-medium"
                >
                  {BANGLADESH_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>উপজেলা / থানা *</span>
                </label>
                {isJessore ? (
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden bg-white transition-all font-medium"
                  >
                    {JASHORE_UPAZILAS.map((up) => (
                      <option key={up} value={up}>
                        {up}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মিরপুর / সদর"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all"
                  />
                )}
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>বিস্তারিত ঠিকানা (গ্রাম/মহল্লা, রোড নং, বাড়ির নাম/নং) *</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="যেমন: ঘোপ সেন্ট্রাল রোড, ৩য় তলা, আইডিয়াল স্কুলের পাশে, যশোর সদর"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all"
              />
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>অর্ডার সংক্রান্ত বিশেষ কোনো নোট (ঐচ্ছিক)</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: সুন্দরবন কুরিয়ারে পাঠাবেন / দুপুরের পর ডেলিভারি দেবেন"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm outline-hidden transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#047857] to-[#064E3B] hover:from-[#064E3B] hover:to-[#047857] text-white font-black text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
              >
                {isSubmitting ? (
                  <span>অর্ডার তৈরি হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>অর্ডার নিশ্চিত করুন (৳{grandTotal})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Order Summary Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-lg">অর্ডার সারাংশ</h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              {toBengaliDigits(cart.length)} আইটেম
            </span>
          </div>

          {/* Book Items List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-14 shrink-0 rounded-md overflow-hidden bg-white border border-slate-200 p-0.5">
                  <img src={item.product.cover_image} alt={item.product.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{item.product.title}</h5>
                  <p className="text-[11px] text-slate-500">
                    ৳{item.product.offer_price} × {toBengaliDigits(item.quantity)}
                  </p>
                </div>
                <span className="text-xs font-black text-[#064E3B]">
                  ৳{item.product.offer_price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-slate-200 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>মোট বইয়ের মূল্য:</span>
              <span className="font-bold text-slate-900">৳{cartTotal}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>ডেলিভারি চার্জ:</span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {isJessore ? 'যশোর সদর/জেলা (৳৬০)' : 'যশোরের বাইরে (৳১২০)'}
                </span>
              </div>
              <span className="font-bold text-slate-900">৳{deliveryCharge}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900 text-base">সর্বমোট বিল:</span>
              <span className="font-black text-2xl text-[#064E3B]">৳{grandTotal}</span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-[#064E3B]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>১০০% নিরাপদ ক্যাশ অন ডেলিভারি</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              অর্ডার করার পর আমাদের প্রতিনিধি আপনার সাথে ফোনে যোগাযোগ করে অর্ডার কনফার্ম করবেন এবং সুন্দরবন / এসএ পরিবহন কুরিয়ারে বই পাঠানো হবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
