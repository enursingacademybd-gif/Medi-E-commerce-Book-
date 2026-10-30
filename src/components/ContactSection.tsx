import React from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, MessageSquare, Clock, Mail, Share2, Compass, ShieldCheck } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { settings } = useStore();

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Branch Contact Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                যশোর প্রধান কার্যালয় ও বুক পয়েন্ট
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                মেডি নার্সিং ভর্তি কোচিং, যশোর
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                নার্সিং ভর্তি সংক্রান্ত যে কোনো পরামর্শ, অফলাইন ক্লাস তথ্য অথবা সরাসরি বই সংগ্রহের জন্য আমাদের যশোর শাখায় চলে আসুন অথবা ফোন করুন।
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">শাখার ঠিকানা:</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {settings.address_text || 'জেল রোড (প্রেসক্লাবের বিপরীতে), যশোর সদর, যশোর।'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">হটলাইন ও ভর্তি তথ্য:</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-mono">
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-emerald-700 font-bold">
                      {settings.contact_phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <MessageSquare className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">হোয়াটসঅ্যাপ অর্ডার ও সাপোর্ট:</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-mono">
                    <a
                      href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent('আসসালামু আলাইকুম। মেডি নার্সিং বই অর্ডার করতে চাই।')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      {settings.whatsapp_number} (সরাসরি চ্যাট করতে ক্লিক করুন)
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">খোলা থাকার সময়:</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    প্রতিদিন সকাল ৮:০০ টা হতে রাত ৮:০০ টা পর্যন্ত (শুক্রবার সহ নিয়মিত সেবা চালু)
                  </p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <span className="text-xs font-bold text-emerald-950 block">সোশ্যাল মিডিয়া ও প্রকাশনা:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={settings.facebook_url || 'https://www.facebook.com/share/1A8wDesiuy/'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>ফেসবুক পেজ</span>
                  </a>
                  <a
                    href={settings.youtube_url || 'https://youtube.com/@medinursingjessore?si=hi1TqeyPcgjDBFVr'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>ইউটিউব চ্যানেল</span>
                  </a>
                  <a
                    href={settings.azaan_publication_url || 'https://www.facebook.com/share/1F8kdidfi5/'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>আজান পাবলিকেশন</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Direct Helpline Banner Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#064E3B] to-[#047857] text-white shadow-xl space-y-6 relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-[#064E3B] text-xs font-black">
                  <span>সরাসরি হোয়াটসঅ্যাপ অর্ডার হটলাইন</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">
                  ফোন বা হোয়াটসঅ্যাপেই বই অর্ডার করুন
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  ওয়েবসাইটে ফর্ম পূরণ করা ছাড়াও সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে আপনি বইয়ের অর্ডার কনফার্ম করতে পারেন। আমাদের প্রতিনিধি দ্রুততম সময়ে রিপ্লাই দিয়ে অর্ডার বুক করে নেবেন।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>অফিশিয়াল হোয়াটসঅ্যাপ নাম্বার</span>
                  <span>সারাদেশে ক্যাশ অন ডেলিভারি</span>
                </div>
                <p className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                  {settings.whatsapp_number}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <a
                  href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি মেডি নার্সিং এর ৯টি বইয়ের সেট অর্ডার করতে চাই।')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-[#D4AF37] text-[#064E3B] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>হোয়াটসঅ্যাপে চ্যাট শুরু করুন</span>
                </a>

                <a
                  href={`tel:${settings.contact_phone}`}
                  className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>সরাসরি কল</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
