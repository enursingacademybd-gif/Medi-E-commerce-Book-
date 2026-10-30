import { Product, StoreSettings } from '../types';

export const BANGLADESH_DISTRICTS = [
  'Jessore (যশোর)',
  'Dhaka (ঢাকা)',
  'Chittagong (চট্টগ্রাম)',
  'Rajshahi (রাজশাহী)',
  'Khulna (খুলনা)',
  'Barisal (বরিশাল)',
  'Sylhet (সিলেট)',
  'Rangpur (রংপুর)',
  'Mymensingh (ময়মনসিংহ)',
  'Bagerhat (বাগেরহাট)',
  'Bandarban (বান্দরবান)',
  'Barguna (বরগুনা)',
  'Bhola (ভোলা)',
  'Bogura (বগুড়া)',
  'Brahmanbaria (ব্রাহ্মণবাড়িয়া)',
  'Chandpur (চাঁদপুর)',
  'Chapai Nawabganj (চাঁপাইনবাবগঞ্জ)',
  'Chuadanga (চুয়াডাঙ্গা)',
  'Comilla (কুমিল্লা)',
  'Cox\'s Bazar (কক্সবাজার)',
  'Dinajpur (দিনাজপুর)',
  'Faridpur (ফরিদপুর)',
  'Feni (ফেনী)',
  'Gaibandha (গাইবান্ধা)',
  'Gazipur (গাজীপুর)',
  'Gopalganj (গোপালগঞ্জ)',
  'Habiganj (হবিগঞ্জ)',
  'Jamalpur (জামালপুর)',
  'Jhalokati (ঝালকাঠি)',
  'Jhenaidah (ঝিনাইদহ)',
  'Joypurhat (জয়পুরহাট)',
  'Khagrachhari (খাগড়াছড়ি)',
  'Kishoreganj (কিশোরগঞ্জ)',
  'Kurigram (কুড়িগ্রাম)',
  'Kushtia (কুষ্টিয়া)',
  'Lakshmipur (লক্ষ্মীপুর)',
  'Lalmonirhat (লালমনিরহাট)',
  'Madaripur (মাদারীপুর)',
  'Magura (মাগুরা)',
  'Manikganj (মানিকগঞ্জ)',
  'Meherpur (মেহেরপুর)',
  'Moulvibazar (মৌলভীবাজার)',
  'Munshiganj (মুন্সীগঞ্জ)',
  'Naogaon (নওগাঁ)',
  'Narail (নড়াইল)',
  'Narayanganj (নারায়ণগঞ্জ)',
  'Narsingdi (নরসিংদী)',
  'Natore (নাটোর)',
  'Netrokona (নেত্রকোণা)',
  'Nilphamari (নীলফামারী)',
  'Noakhali (নোয়াখালী)',
  'Pabna (পাবনা)',
  'Panchagarh (পঞ্চগড়)',
  'Patuakhali (পটুয়াখালী)',
  'Pirojpur (পিরোজপুর)',
  'Rajbari (রাজবাড়ী)',
  'Rangamati (রাঙ্গামাটি)',
  'Satkhira (সাতক্ষীরা)',
  'Shariatpur (শরীয়তপুর)',
  'Sherpur (শেরপুর)',
  'Sirajganj (সিরাজগঞ্জ)',
  'Sunamganj (সুনামগঞ্জ)',
  'Tangail (টাঙ্গাইল)',
  'Thakurgaon (ঠাকুরগাঁও)'
];

export const JASHORE_UPAZILAS = [
  'যশোর সদর (Jessore Sadar)',
  'ঝিকরগাছা (Jhikargachha)',
  'শার্শা / বেনাপোল (Sharsha / Benapole)',
  'মনিরামপুর (Manirampur)',
  'কেশবপুর (Keshabpur)',
  'অভয়নগর (Abhaynagar)',
  'বাঘারপাড়া (Bagherpara)',
  'চৌগাছা (Chowgachha)'
];

// Helper to generate elegant vector book covers with genuine MEDI branding
export function createBookCoverSVG(title: string, sub: string, tag: string, accentColor: string = '#D4AF37'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064E3B"/>
        <stop offset="40%" stop-color="#047857"/>
        <stop offset="100%" stop-color="#022c22"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#A16207"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="4" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>
    <!-- Book Background -->
    <rect width="400" height="560" rx="12" fill="url(#bgGrad)"/>
    <!-- Spine binding effect -->
    <rect x="0" y="0" width="24" height="560" fill="rgba(0,0,0,0.3)"/>
    <line x1="24" y1="0" x2="24" y2="560" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="2"/>
    <line x1="28" y1="0" x2="28" y2="560" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
    
    <!-- Top Organization Header -->
    <rect x="44" y="32" width="324" height="34" rx="17" fill="rgba(255,255,255,0.08)" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="206" y="54" fill="#FDE047" font-family="'Hind Siliguri', sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">MEDI NURSING COACHING, JESSORE</text>
    
    <!-- Tagline Banner -->
    <text x="206" y="85" fill="#E2E8F0" font-family="'Hind Siliguri', sans-serif" font-size="12" text-anchor="middle">স্বপ্ন তোমার, দায়িত্ব আমাদের</text>
    
    <!-- Central Emblem / Caduceus -->
    <circle cx="206" cy="165" r="50" fill="rgba(212,175,55,0.12)" stroke="${accentColor}" stroke-width="2"/>
    <path d="M206 130 v70 M190 145 c16 -12 16 -12 32 0 c-16 12 -16 12 -32 0 M192 165 c14 -10 14 -10 28 0 c-14 10 -14 10 -28 0" stroke="url(#goldGrad)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="206" cy="126" r="6" fill="#FDE047"/>

    <!-- Category Ribbon -->
    <rect x="70" y="235" width="272" height="28" rx="6" fill="${accentColor}" filter="url(#shadow)"/>
    <text x="206" y="254" fill="#064E3B" font-family="'Hind Siliguri', sans-serif" font-size="13" font-weight="900" text-anchor="middle">${tag}</text>

    <!-- Main Book Title Box -->
    <rect x="44" y="280" width="324" height="150" rx="10" fill="rgba(2,44,34,0.7)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
    <text x="206" y="330" fill="#FFFFFF" font-family="'Hind Siliguri', sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${title}</text>
    <text x="206" y="370" fill="#CBD5E1" font-family="'Hind Siliguri', sans-serif" font-size="13" text-anchor="middle" width="280">${sub}</text>
    <line x1="80" y1="400" x2="332" y2="400" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="206" y="418" fill="#FDE047" font-family="'Hind Siliguri', sans-serif" font-size="11" font-weight="bold" text-anchor="middle">সর্বশেষ সিলেবাস ও মানবন্টন অনুযায়ী প্রণীত</text>

    <!-- Bottom Features & Hotline -->
    <rect x="44" y="445" width="324" height="85" rx="8" fill="rgba(255,255,255,0.06)"/>
    <text x="206" y="470" fill="#FFFFFF" font-family="'Hind Siliguri', sans-serif" font-size="12" text-anchor="middle">বিএসসি ইন নার্সিং • ডিপ্লোমা ইন নার্সিং • মিডওয়াইফারি</text>
    <text x="206" y="495" fill="#FDE047" font-family="'Hind Siliguri', sans-serif" font-size="13" font-weight="bold" text-anchor="middle">অর্ডার হটলাইন: ০১৯৫৯ ২৫৩০৩০</text>
    <text x="206" y="516" fill="#94A3B8" font-family="'Hind Siliguri', sans-serif" font-size="11" text-anchor="middle">পরিচালনায়: এক্সপার্ট নার্সিং ট্রেইনার ও মেডিকেল টিম</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'medi-book-1',
    title: 'MEDI নার্সিং গাইড (পূর্ণাঙ্গ ভর্তি সহায়িকা)',
    bangla_title: 'মেডি নার্সিং গাইড (বিএসসি, ডিপ্লোমা ও মিডওয়াইফারি ভর্তি সহায়িকা)',
    slug: 'medi-nursing-guide',
    description: 'নার্সিং ভর্তি পরীক্ষার সম্পূর্ণ সিলেবাসভিত্তিক সমন্বিত গাইড। বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান ও সাধারণ বিজ্ঞানের পুঙ্খানুপুঙ্খ ব্যাখ্যা, শর্টকাট টেকনিক ও অধ্যায়ভিত্তিক গুরুত্বপূর্ণ এমসিকিউ সহ সংকলিত।',
    category: 'common',
    cover_image: createBookCoverSVG('MEDI নার্সিং গাইড', 'বিএসসি ও ডিপ্লোমা ভর্তি সহায়িকা', '★ মেগা বেস্টসেলার গাইড ★', '#D4AF37'),
    regular_price: 550,
    offer_price: 430,
    stock: 120,
    is_active: true,
    is_featured: true,
    sort_order: 1,
    pages: 680,
    edition: '২০২৬-২৭ সংস্করণ',
    features: [
      'বিএসসি ও ডিপ্লোমার পূর্ণাঙ্গ সিলেবাস কভার',
      'অধ্যায়ভিত্তিক বিগত ১০ বছরের প্রশ্নোত্তর',
      'সহজ ভাষায় ব্যাখ্যা ও শর্টকাট টেকনিক',
      'নিজস্ব মেডি নার্সিং রিসার্চ টিম কর্তৃক যাচাইকৃত'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'medi-book-2',
    title: 'MEDI নার্সিং প্রশ্নব্যাংক ও সমাধান',
    bangla_title: 'মেডি নার্সিং প্রশ্নব্যাংক ও সমাধান (ব্যাখ্যামূলক)',
    slug: 'medi-nursing-question-bank',
    description: 'বিগত ১২ বছরের বিএসসি ইন নার্সিং, ডিপ্লোমা ইন নার্সিং সাইন্স অ্যান্ড মিডওয়াইফারি এবং ডিপ্লোমা ইন মিডওয়াইফারি পরীক্ষার প্রশ্ন ও নির্ভুল ব্যাখ্যামূলক সমাধান। সাথে ৫ সেট ওএমআর শিট।',
    category: 'question_bank',
    cover_image: createBookCoverSVG('MEDI নার্সিং প্রশ্নব্যাংক', 'বিগত ১২ বছরের ব্যাখ্যামূলক সমাধান', '★ আসল প্রশ্ন ও উত্তর ★', '#38BDF8'),
    regular_price: 480,
    offer_price: 380,
    stock: 95,
    is_active: true,
    is_featured: true,
    sort_order: 2,
    pages: 520,
    edition: '২০২৬ সংস্করণ',
    features: [
      '২০০৮ থেকে ২০২৫ সালের সব প্রশ্ন ও সমাধান',
      'প্রতিটি প্রশ্নের গভীর বিশ্লেষণ ও নির্ভুল উত্তর',
      'ওএমআর ফিল-আপের সঠিক দিকনির্দেশনা',
      'বারবার আসা গুরুত্বপূর্ণ প্রশ্ন আলাদাভাবে চিহ্নিত'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-02').toISOString(),
    updated_at: new Date('2026-01-02').toISOString()
  },
  {
    id: 'medi-book-3',
    title: 'MEDI জীববিজ্ঞান স্পেশাল (BSc Special)',
    bangla_title: 'মেডি জীববিজ্ঞান স্পেশাল (বিএসসি নার্সিং ভর্তি সহায়িকা)',
    slug: 'medi-biology-special',
    description: 'বিএসসি ইন নার্সিং ভর্তি প্রার্থীদের জন্য উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞানের রঙিন চিত্রসহ অত্যন্ত তথ্যবহুল বই। বিগত বছরের কঠিন বায়োলজি প্রশ্নগুলোর সহজ সমাধান।',
    category: 'bsc',
    cover_image: createBookCoverSVG('MEDI জীববিজ্ঞান স্পেশাল', 'উদ্ভিদ ও প্রাণিবিজ্ঞান চিত্রসহ বিশ্লেষণ', '★ বিএসসি স্পেশাল বায়োলজি ★', '#10B981'),
    regular_price: 420,
    offer_price: 330,
    stock: 75,
    is_active: true,
    is_featured: true,
    sort_order: 3,
    pages: 440,
    edition: '২০২৬ সংস্করণ',
    features: [
      'উচ্চ মাধ্যমিক সিলেবাসের পূর্ণাঙ্গ বায়োলজি নোট',
      'গুরুত্বপূর্ণ চিত্র ও চার্টের রঙিন উপস্থাপন',
      'মেডিকেল ও নার্সিং স্ট্যান্ডার্ড ১০০০+ কুইক এমসিকিউ',
      'স্মৃতিতে রাখার বিশেষ ছন্দ ও ট্রিকস'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-03').toISOString(),
    updated_at: new Date('2026-01-03').toISOString()
  },
  {
    id: 'medi-book-4',
    title: 'MEDI পদার্থ ও রসায়ন প্রস্তুতি',
    bangla_title: 'মেডি পদার্থ ও রসায়ন প্রস্তুতি (বিএসসি নার্সিং)',
    slug: 'medi-physics-chemistry',
    description: 'বিএসসি ইন নার্সিং ভর্তি পরীক্ষার পদার্থবিজ্ঞান ও রসায়ন বিষয়ের ভয় দূর করার জন্য শতভাগ কার্যকরী বই। সূত্র, মৌলিক ধারণা ও গাণিতিক সমস্যার শর্টকাট মেথড।',
    category: 'bsc',
    cover_image: createBookCoverSVG('MEDI পদার্থ ও রসায়ন প্রস্তুতি', 'সকল সূত্র ও শর্টকাট টেকনিক', '★ সায়েন্স মাস্টার বুক ★', '#F59E0B'),
    regular_price: 450,
    offer_price: 350,
    stock: 60,
    is_active: true,
    is_featured: false,
    sort_order: 4,
    pages: 460,
    edition: '২০২৬ সংস্করণ',
    features: [
      'ক্যালকুলেটর ছাড়া দ্রুত হিসাব করার বিশেষ কৌশল',
      'রসায়নের বিক্রিয়া ও পর্যায় সারণীর সহজ চার্ট',
      'টপিকভিত্তিক বিগত ভর্তি পরীক্ষার প্রশ্ন আলোচনা',
      'সেলফ অ্যাসেসমেন্ট টেস্ট পেপার'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-04').toISOString(),
    updated_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'medi-book-5',
    title: 'MEDI সাধারণ জ্ঞান ও সাম্প্রতিক বিষয়াবলী',
    bangla_title: 'মেডি সাধারণ জ্ঞান ও সাম্প্রতিক স্বাস্থ্য বুলেটিন',
    slug: 'medi-general-knowledge-health',
    description: 'বাংলাদেশ বিষয়াবলী, আন্তর্জাতিক অঙ্গন, স্বাস্থ্য সেবা, বিখ্যাত নার্সিং ব্যক্তিত্ব (ফ্লোরেন্স নাইটিঙ্গেল সহ) এবং সাম্প্রতিক খবরাখবরের সমৃদ্ধ সংকলন।',
    category: 'common',
    cover_image: createBookCoverSVG('MEDI সাধারণ জ্ঞান ও স্বাস্থ্য', 'বাংলাদেশ, আন্তর্জাতিক ও স্বাস্থ্য তথ্য', '★ শতভাগ কমন উপযোগী ★', '#EC4899'),
    regular_price: 350,
    offer_price: 270,
    stock: 110,
    is_active: true,
    is_featured: false,
    sort_order: 5,
    pages: 360,
    edition: '২০২৬ আপডেট সংস্করণ',
    features: [
      'নার্সিং সম্পর্কিত বিশেষ সাধারণ জ্ঞান ও স্বাস্থ্য বুলেটিন',
      'ফ্লোরেন্স নাইটিঙ্গেল ও নার্সিং ইতিহাসের বিস্তারিত',
      'সাম্প্রতিক জাতীয় ও আন্তর্জাতিক ঘটনাবলী',
      'মডেল প্রশ্ন ও ২০০০+ এক নজরে তথ্য'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'medi-book-6',
    title: 'MEDI ইংলিশ মাস্টার ফর নার্সিং',
    bangla_title: 'মেডি ইংলিশ মাস্টার ফর নার্সিং এডমিশন',
    slug: 'medi-english-master-nursing',
    description: 'নার্সিং ভর্তি পরীক্ষায় ইংরেজিতে সর্বোচ্চ নম্বর নিশ্চিত করতে ব্যাকরণ (Grammar), প্রিপজিশন, সিনোনিম-অ্যান্টোনিম, ইডিয়মস এবং কমপ্রিহেনশন-এর বিশেষ বই।',
    category: 'common',
    cover_image: createBookCoverSVG('MEDI ইংলিশ মাস্টার', 'গ্রামার, ভোকাবুলারি ও প্রিভিয়াস সমাধান', '★ ইংলিশ এ প্লাস টার্গেট ★', '#8B5CF6'),
    regular_price: 400,
    offer_price: 310,
    stock: 80,
    is_active: true,
    is_featured: false,
    sort_order: 6,
    pages: 390,
    edition: '২০২৬ সংস্করণ',
    features: [
      'প্রতিটি গ্রামার নিয়মের বাস্তব উদাহরণ ও বাংলা অনুবাদ',
      'সবচেয়ে গুরুত্বপূর্ণ ১০০০+ সিলেক্টেড ভোকাবুলারি',
      'মেডি নার্সিং কোচিংয়ের স্পেশাল প্র্যাকটিস শিট',
      'বিগত বছরের সকল নার্সিং ইংরেজি প্রশ্ন সমাধান'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-06').toISOString(),
    updated_at: new Date('2026-01-06').toISOString()
  },
  {
    id: 'medi-book-7',
    title: 'MEDI সাধারণ বিজ্ঞান ও সাধারণ গণিত',
    bangla_title: 'মেডি সাধারণ বিজ্ঞান ও সাধারণ গণিত (ডিপ্লোমা ও মিডওয়াইফারি)',
    slug: 'medi-general-science-math',
    description: 'ডিপ্লোমা ইন নার্সিং এবং মিডওয়াইফারি শিক্ষার্থীদের জন্য সাধারণ বিজ্ঞান ও সাধারণ গণিতের সহজ সমাধান। অংকের জট খোলা নিয়ম ও বিজ্ঞানের মৌলিক বিষয়াবলী।',
    category: 'diploma',
    cover_image: createBookCoverSVG('MEDI সাধারণ বিজ্ঞান ও গণিত', 'ডিপ্লোমা ও মিডওয়াইফারি বিশেষ প্রস্তুতি', '★ ডিপ্লোমা স্পেশালিস্ট ★', '#14B8A6'),
    regular_price: 380,
    offer_price: 290,
    stock: 85,
    is_active: true,
    is_featured: false,
    sort_order: 7,
    pages: 410,
    edition: '২০২৬ সংস্করণ',
    features: [
      'ডিপ্লোমা ও মিডওয়াইফারি সিলেবাসের শতভাগ প্রতিফলন',
      'বীজগণিত, পাটিগণিত ও জ্যামিতির সহজ শর্টকাট',
      'দৈনন্দিন জীবন ও বিজ্ঞানের গুরুত্বপূর্ণ প্রশ্নোত্তর',
      'পরীক্ষার হলে সময় বাঁচানোর ট্রিকস'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-07').toISOString(),
    updated_at: new Date('2026-01-07').toISOString()
  },
  {
    id: 'medi-book-8',
    title: 'MEDI নার্সিং ফাইনাল মডেল টেস্ট ও OMR শিট',
    bangla_title: 'মেডি নার্সিং ফাইনাল মডেল টেস্ট (২০ সেট ওএমআর শিট সহ)',
    slug: 'medi-nursing-model-tests',
    description: 'চূড়ান্ত ভর্তি পরীক্ষার অনুরূপ সময় ধরে অনুশীলনের জন্য ২০ সেট পূর্ণাঙ্গ মডেল টেস্ট ও ২০টি আসল ওএমআর শিট। নিজের প্রস্তুতি যাচাইয়ের সেরা মাধ্যম।',
    category: 'common',
    cover_image: createBookCoverSVG('MEDI ফাইনাল মডেল টেস্ট', '২০ সেট পূর্ণাঙ্গ টেস্ট ও ওএমআর শিট', '★ আসল পরীক্ষার অনুভূতি ★', '#EF4444'),
    regular_price: 360,
    offer_price: 280,
    stock: 140,
    is_active: true,
    is_featured: true,
    sort_order: 8,
    pages: 320,
    edition: '২০২৬ সংস্করণ',
    features: [
      'আসল নার্সিং ভর্তি পরীক্ষার অনুরূপ ১০০ নম্বরের প্রশ্নপত্র',
      'সাথে ২০টি প্রিন্টেড ওএমআর শিট অন্তর্ভুক্ত',
      'প্রতিটি মডেল টেস্টের পুঙ্খানুপুঙ্খ ব্যাখ্যাসহ সলিউশন',
      'টাইম ম্যানেজমেন্ট ও ভুল এড়ানোর গাইডলাইন'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-08').toISOString(),
    updated_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'medi-book-9',
    title: 'MEDI বাংলা ব্যাকরণ ও সাহিত্য সহায়িকা',
    bangla_title: 'মেডি বাংলা ব্যাকরণ ও সাহিত্য স্পেশাল',
    slug: 'medi-bangla-grammar-literature',
    description: 'নার্সিং ভর্তি পরীক্ষায় বাংলা অংশে পূর্ণ নম্বর পাওয়ার নিশ্চয়তা। নবম-দশম শ্রেণির ব্যাকরণ বোর্ডের বইয়ের নির্যাস ও বাংলা সাহিত্যের গুরুত্বপূর্ণ অংশের সমন্বয়ে তৈরি।',
    category: 'common',
    cover_image: createBookCoverSVG('MEDI বাংলা ব্যাকরণ ও সাহিত্য', 'সিলেবাসভিত্তিক শতভাগ কমন উপযোগী', '★ বাংলা ব্যাকরণ স্পেশাল ★', '#6366F1'),
    regular_price: 340,
    offer_price: 260,
    stock: 90,
    is_active: true,
    is_featured: false,
    sort_order: 9,
    pages: 340,
    edition: '২০২৬ সংস্করণ',
    features: [
      'বোর্ড ব্যাকরণের প্রতিটি বিষয়ের সহজ নিয়মে ব্যাখ্যা',
      'ধ্বনি, বর্ণ, সন্ধি, সমাস, কারক ও প্রত্যয়ের স্পেশাল নোট',
      'প্রাচীন, মধ্য ও আধুনিক বাংলা সাহিত্যের নির্বাচিত প্রশ্ন',
      'প্রিভিয়াস ইয়ারের শতভাগ বাংলা প্রশ্নের সমাধান'
    ],
    deleted_at: null,
    created_at: new Date('2026-01-09').toISOString(),
    updated_at: new Date('2026-01-09').toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  website_name: 'MEDI Nursing Book Store',
  logo: '/logo.png',
  tagline: 'স্বপ্ন তোমার, দায়িত্ব আমাদের',
  whatsapp_number: '01959253030',
  whatsapp_international: '8801959253030',
  contact_phone: '01959253030',
  facebook_url: 'https://www.facebook.com/share/1A8wDesiuy/',
  youtube_url: 'https://youtube.com/@medinursingjessore?si=hi1TqeyPcgjDBFVr',
  azaan_publication_url: 'https://www.facebook.com/share/1F8kdidfi5/',
  address_text: 'মেডি নার্সিং ভর্তি কোচিং, জেল রোড (প্রেসক্লাবের বিপরীতে), যশোর সদর, যশোর।',
  delivery_charge_jessore: 60,
  delivery_charge_outside: 120,
  banner_headline: 'নার্সিং ভর্তি প্রস্তুতির নির্ভরযোগ্য বই এখন এক জায়গায়।',
  banner_subtitle: 'MEDI Nursing-এর ৯টি প্রয়োজনীয় বই নিয়ে শুরু হোক আপনার সরকারি নার্সিং কলেজের স্বপ্নযাত্রা।',
  notice_text: '📢 বিশেষ ছাড়: যেকোনো ৩টি বই একসাথে অর্ডারে সারা বাংলাদেশে ক্যাশ অন ডেলিভারি এবং ফ্রি ওএমআর শিট উপহার!',
  free_delivery_threshold: 1500
};

export const TESTIMONIALS = [
  {
    id: '1',
    name: 'ফারহানা ইসলাম তিশা',
    role: 'শিক্ষার্থী, ঢাকা নার্সিং কলেজ (বিএসসি ইন নার্সিং)',
    comment: 'মেডি নার্সিং গাইড এবং প্রশ্নব্যাংক আমাকে নার্সিং ভর্তিতে প্রথম চান্স পেতে সাহায্য করেছে। বিশেষ করে বায়োলজি স্পেশাল বইটির চিত্র ও শর্টকাটগুলো অসাধারণ!',
    rating: 5,
    session: '২০২৪-২৫ সেশন'
  },
  {
    id: '2',
    name: 'সোহাগ হোসেন',
    role: 'শিক্ষার্থী, যশোর নার্সিং ইনস্টিটিউট (ডিপ্লোমা)',
    comment: 'যশোরে মেডি নার্সিং কোচিংয়ের ক্লাসের পাশাপাশি তাদের সাধারণ বিজ্ঞান ও গণিত বইটি ফলো করেছি। আলহামদুলিল্লাহ সরকারি ডিপ্লোমাতে সেরা মেধা তালিকায় আসতে পেরেছি।',
    rating: 5,
    session: '২০২৪-২৫ সেশন'
  },
  {
    id: '3',
    name: 'মায়িশা তাসনিম',
    role: 'শিক্ষার্থী, রাজশাহী নার্সিং কলেজ',
    comment: 'হোয়াটসঅ্যাপে অর্ডার করার মাত্র ২ দিনের মধ্যেই সুন্দর প্যাকেজিংয়ে সুন্দরবন কুরিয়ারে বই পেয়েছি। ক্যাশ অন ডেলিভারি থাকায় নিশ্চিন্তে নিয়েছি।',
    rating: 5,
    session: '২০২৩-২৪ সেশন'
  }
];
