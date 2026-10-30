import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, MessageSquare, Truck, Award, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow }) => {
  const { settings, activeProducts } = useStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022c22] text-white py-12 sm:py-16 lg:py-20">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/40 text-[#FDE047] text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: '6s' }} />
              <span>মেডি নার্সিং ভর্তি কোচিং যশোর • অফিশিয়াল বুক শপ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
              {settings.banner_headline || 'নার্সিং ভর্তি প্রস্তুতির নির্ভরযোগ্য বই এখন এক জায়গায়।'}
            </h1>

            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {settings.banner_subtitle || 'MEDI Nursing-এর ৯টি প্রয়োজনীয় বই নিয়ে শুরু হোক আপনার সরকারি নার্সিং কলেজের স্বপ্নযাত্রা।'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-[#D4AF37] text-[#064E3B] font-extrabold text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>বইগুলো দেখুন (Shop Now)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsapp_international}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি মেডি নার্সিং এর ৯টি বই সম্পর্কে জানতে এবং অর্ডার করতে আগ্রহী।')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-400/30 text-white font-bold text-base transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>হোয়াটসঅ্যাপে অর্ডার (০১৯৫৯ ২৫৩০৩০)</span>
              </a>
            </div>

            {/* Trust Points */}
            <div className="pt-6 border-t border-emerald-600/30 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 font-medium">
                <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 font-medium">
                <Award className="w-4 h-4 text-amber-300 shrink-0" />
                <span>১০০% আসল ও সর্বাধুনিক সংস্করণ</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm text-emerald-100 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>যশোর কোচিং শাখা নিশ্চিতকরণ</span>
              </div>
            </div>
          </div>

          {/* Right Showcase Column (Displaying books showcase cards) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-300" />
                    <span className="font-bold text-sm tracking-wide text-white">৯টি প্রয়োজনীয় বইয়ের প্যাকেজ</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-[#064E3B] text-xs font-black">
                    সর্বোচ্চ ২৫% ছাড়
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {activeProducts.slice(0, 3).map((book, idx) => (
                    <div
                      key={book.id}
                      onClick={onShopNow}
                      className="cursor-pointer group flex flex-col items-center bg-black/30 p-2 rounded-xl border border-white/10 hover:border-amber-300/60 transition-all hover:-translate-y-1"
                    >
                      <div className="w-full aspect-3/4 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] font-bold text-white text-center line-clamp-1">
                        {book.title.replace('MEDI ', '')}
                      </p>
                      <span className="text-[10px] text-amber-300 font-bold">৳{book.offer_price}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#064E3B]/80 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-200 block">বিএসসি • ডিপ্লোমা • মিডওয়াইফারি</span>
                    <span className="text-white font-bold">ভর্তির ১০০% সিলেবাস কভারেজ</span>
                  </div>
                  <button
                    onClick={onShopNow}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#064E3B] font-bold text-xs"
                  >
                    বইগুলো দেখুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
