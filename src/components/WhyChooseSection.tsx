import React from 'react';
import { Award, BookOpen, Target, CheckCircle2, Users, Clock, ShieldCheck, HeartPulse } from 'lucide-react';

export const WhyChooseSection: React.FC = () => {
  const points = [
    {
      icon: Target,
      title: '১০০% নার্সিং সিলেবাস ভিত্তিক',
      desc: 'বিএসসি ইন নার্সিং, ডিপ্লোমা ইন নার্সিং সাইন্স এবং মিডওয়াইফারি ভর্তি পরীক্ষার সর্বশেষ মানবন্টন অনুযায়ী প্রতিটি বই বিশেষভাবে সাজানো।'
    },
    {
      icon: Award,
      title: 'বিগত ১২ বছরের নির্ভুল সমাধান',
      desc: 'বিগত বছরের প্রতিটি প্রশ্ন নির্ভুল ব্যাখ্যামূলক সমাধানসহ সংকলিত, যা পরীক্ষায় হুবহু বা অনুরূপে কমন পেতে সর্বোচ্চ সহায়তা করে।'
    },
    {
      icon: HeartPulse,
      title: 'অভিজ্ঞ নার্সিং ট্রেইনার ও মেডিকেল টিম',
      desc: 'মেডি নার্সিং কোচিং যশোর-এর অভিজ্ঞ মেন্টর ও সরকারি নার্সিং কলেজের ট্রেইনারদের প্রত্যক্ষ তত্ত্বাবধানে রচিত ও সম্পাদিত।'
    },
    {
      icon: BookOpen,
      title: 'রঙিন চিত্র ও অধ্যায়ভিত্তিক শর্টকাট',
      desc: 'বায়োলজি, ফিজিক্স, কেমিস্ট্রির কঠিন বিষয়গুলো সহজ ছন্দ ও চিত্রের মাধ্যমে উপস্থাপন, যেন অল্প সময়ে স্মৃতিতে স্থায়ী হয়।'
    },
    {
      icon: Users,
      title: 'হাজারো শিক্ষার্থীর সরকারি নার্সিং চান্স',
      desc: 'গত ৫ বছরে মেডি নার্সিং-এর দিকনির্দেশনা ও বই পড়ে ঢাকা, চট্টগ্রাম, রাজশাহী, যশোর সহ বিভিন্ন সরকারি নার্সিং কলেজে সর্বোচ্চ সংখ্যক শিক্ষার্থী সফল হয়েছে।'
    },
    {
      icon: Clock,
      title: 'সরাসরি দ্রুত কুরিয়ার ডেলিভারি',
      desc: 'যশোরে নিজস্ব ডেলিভারিম্যান ও সারা বাংলাদেশে সুন্দরবন/রেডেক্স কুরিয়ারে ক্যাশ অন ডেলিভারি সুবিধায় ২-৩ দিনের মধ্যে হোম ডেলিভারি।'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#064E3B] text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>সফলতার বিশ্বস্ত ঠিকানা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            কেন বেছে নেবেন মেডি নার্সিং-এর বইসমূহ?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            সরকারি নার্সিং কলেজে চান্স পাওয়ার স্বপ্ন পূরণে সাধারণ কোনো গাইড নয়, প্রয়োজন নার্সিং ভর্তি উপযোগী সুনির্দিষ্ট ও পরীক্ষিত প্রস্তুতি।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 shadow-xs hover:shadow-lg transition-all group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-[#064E3B] text-[#064E3B] group-hover:text-amber-300 flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#064E3B] transition-colors">
                  {pt.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
