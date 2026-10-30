import React, { useState, useRef } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { calculateDiscountPercent } from '../../utils/orderUtils';
import { createBookCoverSVG } from '../../data/initialBooks';
import { X, Upload, Image, Check, AlertCircle, Sparkles, Layers } from 'lucide-react';

interface BookFormModalProps {
  book?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({ book, onClose, onSaved }) => {
  const { addProduct, updateProduct, uploadProductImage } = useStore();

  const [title, setTitle] = useState(book?.title || '');
  const [banglaTitle, setBanglaTitle] = useState(book?.bangla_title || '');
  const [description, setDescription] = useState(book?.description || '');
  const [regularPrice, setRegularPrice] = useState(book?.regular_price || 450);
  const [offerPrice, setOfferPrice] = useState(book?.offer_price || 350);
  const [stock, setStock] = useState(book?.stock || 50);
  const [coverImage, setCoverImage] = useState(
    book?.cover_image || createBookCoverSVG('নতুন বই', 'নার্সিং ভর্তি সহায়ক', '★ বিশেষ সংস্করণ ★')
  );
  const [category, setCategory] = useState<'common' | 'bsc' | 'diploma' | 'midwifery' | 'question_bank'>(
    (book?.category as any) || 'common'
  );
  const [isActive, setIsActive] = useState(book ? book.is_active : true);
  const [isFeatured, setIsFeatured] = useState(book ? book.is_featured : false);
  const [sortOrder, setSortOrder] = useState(book?.sort_order || 1);
  const [pages, setPages] = useState(book?.pages || 400);
  const [edition, setEdition] = useState(book?.edition || '২০২৬ সংস্করণ');
  const [featuresText, setFeaturesText] = useState(
    book?.features?.join('\n') || 'বিগত বছরের প্রশ্ন ও নির্ভুল সমাধান\nঅধ্যায়ভিত্তিক শর্টকাট টেকনিক ও ওএমআর শিট'
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const discount = calculateDiscountPercent(Number(regularPrice), Number(offerPrice));

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate that it is an image
    const isImage =
      file.type.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(file.name);

    if (!isImage) {
      setError('অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (JPG, PNG, WEBP, ইত্যাদি)');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploadedUrl = await uploadProductImage(file);
      setCoverImage(uploadedUrl);
    } catch (err: any) {
      setError(err.message || 'ছবি আপলোডে সমস্যা হয়েছে।');
    } finally {
      setIsUploading(false);
      // Reset input so re-selecting same file works
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('বইয়ের শিরোনাম আবশ্যক');
      return;
    }

    if (Number(regularPrice) < 0 || Number(offerPrice) < 0) {
      setError('মূল্য ঋণাত্মক হতে পারে না');
      return;
    }

    setIsSaving(true);

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-') || `book-${Date.now()}`;

    try {
      if (book) {
        await updateProduct(book.id, {
          title: title.trim(),
          bangla_title: banglaTitle.trim(),
          description: description.trim(),
          regular_price: Number(regularPrice),
          offer_price: Number(offerPrice),
          stock: Number(stock),
          cover_image: coverImage,
          category,
          is_active: isActive,
          is_featured: isFeatured,
          sort_order: Number(sortOrder),
          pages: Number(pages),
          edition: edition.trim(),
          features
        });
      } else {
        await addProduct({
          title: title.trim(),
          bangla_title: banglaTitle.trim(),
          slug,
          description: description.trim(),
          regular_price: Number(regularPrice),
          offer_price: Number(offerPrice),
          stock: Number(stock),
          cover_image: coverImage,
          category,
          is_active: isActive,
          is_featured: isFeatured,
          sort_order: Number(sortOrder),
          pages: Number(pages),
          edition: edition.trim(),
          features
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'সংরক্ষণে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#047857]" />
            <h3 className="font-bold text-slate-900 text-base">
              {book ? 'বইয়ের তথ্য ও মূল্য সম্পাদনা' : 'নতুন বই যোগ করুন'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Cover Image Upload & Preview */}
            <div className="md:col-span-5 flex flex-col items-center space-y-3">
              <label className="block text-xs font-bold text-slate-700 self-start">
                বইয়ের কভার ছবি (গ্যালারি থেকে আপলোড) *
              </label>

              <div className="w-full max-w-[200px] aspect-3/4 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 p-2 bg-slate-50 flex items-center justify-center relative group">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    আপলোড হচ্ছে...
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full max-w-[200px] py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#064E3B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>{isUploading ? 'প্রসেসিং হচ্ছে...' : coverImage ? 'কভার ছবি পরিবর্তন' : 'গ্যালারি থেকে ছবি নিন'}</span>
              </button>

              <div className="w-full max-w-[200px] text-left space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">অথবা ছবির অনলাইন লিঙ্ক দিন:</span>
                <input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={coverImage.startsWith('data:') ? '' : coverImage}
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      setCoverImage(e.target.value.trim());
                    }
                  }}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-[10px] font-mono outline-hidden focus:border-emerald-600"
                />
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                মোবাইলের ফটো গ্যালারি বা ক্যামেরা থেকে যেকোনো ছবি বেছে নিন (স্বয়ংক্রিয়ভাবে কম্প্রেস হবে)।
              </p>
            </div>

            {/* Inputs Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বইয়ের মূল নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: MEDI নার্সিং গাইড"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বাংলা সাবটাইটেল (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিএসসি ও ডিপ্লোমা ভর্তি সহায়িকা"
                  value={banglaTitle}
                  onChange={(e) => setBanglaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রেগুলার মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অফার মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-emerald-800 focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্টক (কপি)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              {discount > 0 && (
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                  স্বয়ংক্রিয় ছাড় হিসাব: {discount}% ডিসকাউন্ট
                </div>
              )}

              {/* Category, Edition, Pages, & Sort Order */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:border-emerald-600 outline-hidden font-medium"
                  >
                    <option value="common">কমন / সাধারণ</option>
                    <option value="bsc">বিএসসি ইন নার্সিং</option>
                    <option value="diploma">ডিপ্লোমা নার্সিং</option>
                    <option value="midwifery">মিডওয়াইফারি</option>
                    <option value="question_bank">প্রশ্নব্যাংক</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সংস্করণ</label>
                  <input
                    type="text"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পৃষ্ঠা সংখ্যা</label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1 flex items-center gap-1" title="ওয়েবসাইটে বইটি কত নম্বরে দেখাবে">
                    <span>সিরিয়াল ক্রম</span>
                    <span className="text-[10px] text-amber-600 font-bold">★</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 text-xs font-bold font-mono text-[#064E3B] focus:border-emerald-600 outline-hidden"
                    placeholder="১, ২, ৩..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বইয়ের বিস্তারিত বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden"
                />
              </div>

              {/* Features bullet points */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিশেষ বৈশিষ্ট্য (প্রতি লাইনে একটি)
                </label>
                <textarea
                  rows={2}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-hidden font-mono"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <span>ওয়েবসাইটে সক্রিয় (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                  />
                  <span>ফিচার্ড বই (Featured)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'বই সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
