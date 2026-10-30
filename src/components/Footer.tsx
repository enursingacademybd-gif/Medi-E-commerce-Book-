import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookOpen, Phone, MessageSquare, MapPin, Facebook, Youtube, ShieldCheck, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'books' | 'about' | 'contact' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  const facebookUrl = settings.facebook_url || 'https://www.facebook.com/share/1A8wDesiuy/';
  const youtubeUrl = settings.youtube_url || 'https://youtube.com/@medinursingjessore?si=hi1TqeyPcgjDBFVr';
  const azaanPublicationUrl = settings.azaan_publication_url || 'https://www.facebook.com/share/1F8kdidfi5/';

  return (
    <footer className="bg-[#022c22] text-slate-300 border-t border-emerald-950 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logo || '/logo.png'}
                alt={settings.website_name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#D4AF37] shadow-md bg-white shrink-0"
              />
              <div>
                <span className="text-xl font-bold text-white block leading-tight">
                  {settings.website_name}
                </span>
                <span className="text-xs text-amber-400 font-semibold">{settings.tagline}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              মেডি নার্সিং ভর্তি কোচিং, যশোর-এর ৯টি নির্ভরযোগ্য নার্সিং গাইড, প্রশ্নব্যাংক ও মডেল টেস্ট বইয়ের অফিসিয়াল অনলাইন স্টোর। বিএসসি, ডিপ্লোমা ও মিডওয়াইফারি প্রার্থীদের বিশ্বস্ত সঙ্গী।
            </p>

            {/* Social Links including Facebook, YouTube & Azaan Publication */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-semibold text-emerald-300 block">আমাদের সাথে যুক্ত থাকুন:</span>
              <div className="flex flex-wrap items-center gap-3">
                {/* Official Facebook Page */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-emerald-900/80 hover:bg-[#1877F2] flex items-center justify-center text-white transition-colors shadow-xs"
                  title="মেডি নার্সিং ফেসবুক পেজ"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                {/* YouTube Channel */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-emerald-900/80 hover:bg-[#FF0000] flex items-center justify-center text-white transition-colors shadow-xs"
                  title="মেডি নার্সিং যশোর ইউটিউব চ্যানেল"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                {/* WhatsApp Chat */}
                <a
                  href={`https://wa.me/${settings.whatsapp_international}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-emerald-900/80 hover:bg-[#25D366] flex items-center justify-center text-white transition-colors shadow-xs"
                  title="হোয়াটসঅ্যাপ চ্যাট"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>

                {/* Direct Phone Call */}
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="w-9 h-9 rounded-full bg-emerald-900/80 hover:bg-amber-600 flex items-center justify-center text-white transition-colors shadow-xs"
                  title="সরাসরি কল"
                >
                  <Phone className="w-4 h-4" />
                </a>

                {/* Azaan Publication Page Link Badge */}
                <a
                  href={azaanPublicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-[11px] font-semibold text-emerald-200 hover:text-white flex items-center gap-1.5 transition-colors"
                  title="আজান পাবলিকেশন ফেসবুক পেজ"
                >
                  <span>আজান পাবলিকেশন</span>
                  <ExternalLink className="w-3 h-3 text-amber-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links (Customer facing only - NO visible admin button) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-900/80 pb-2">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  মূল পাতা (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('books')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  সকল নার্সিং বই (৯টি বই)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  কেন মেডি নার্সিং?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  যোগাযোগ ও যশোর শাখা
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-900/80 pb-2">
              অফিস ও যোগাযোগ
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address_text}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হটলাইন: {settings.contact_phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>হোয়াটসঅ্যাপ: {settings.whatsapp_number}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-200">
                ডেলিভারি: যশোরে ৬০ টাকা, সারা বাংলাদেশে ১২০ টাকা। সুন্দরবন ও এসএ পরিবহন কুরিয়ার।
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright with Secret Admin Access */}
        <div className="pt-6 border-t border-emerald-950 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* Secret owner access: Clicking "MEDI Nursing Book Store" here opens the admin portal */}
          <p className="select-none">
            © ২০২৬{' '}
            <button
              onClick={() => onNavigate('admin')}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-default focus:outline-hidden"
              title="MEDI Nursing Book Store"
            >
              {settings.website_name}
            </button>
            {' '}| সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>মেডি নার্সিং ভর্তি কোচিং, যশোর দ্বারা পরিচালিত</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
