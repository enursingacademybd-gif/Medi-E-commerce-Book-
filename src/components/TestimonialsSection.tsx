import React from 'react';
import { TESTIMONIALS } from '../data/initialBooks';
import { Star, Quote, Award } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-700" />
            <span>কৃতী শিক্ষার্থীদের অভিমত</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            যারা মেডি নার্সিং পড়ে সরকারি কলেজে স্থান পেয়েছে
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            আমাদের বই ও কোচিংয়ের সহায়তায় বিভিন্ন সরকারি নার্সিং কলেজে চান্সপ্রাপ্ত শিক্ষার্থীদের বাস্তব অভিজ্ঞতা
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {t.session}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#064E3B] text-amber-300 font-bold flex items-center justify-center text-sm">
                  {t.name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
