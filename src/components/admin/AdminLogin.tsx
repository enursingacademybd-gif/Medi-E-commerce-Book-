import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight, KeyRound, AlertCircle, Info } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { loginAdmin, setupFirstAdmin, isSupabaseLive } = useStore();
  const [mode, setMode] = useState<'login' | 'setup'>('login');

  const [email, setEmail] = useState('admin@medinursing.com');
  const [password, setPassword] = useState('MediAdmin@2026');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginAdmin(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.error || 'লগইন ব্যর্থ হয়েছে।');
        }
      } else {
        const res = await setupFirstAdmin(email, password, fullName || 'অ্যাডমিনিস্ট্রেটর');
        if (res.success) {
          onSuccess();
        } else {
          setError(res.error || 'এডমিন তৈরি করা সম্ভব হয়নি।');
        }
      }
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@medinursing.com');
    setPassword('MediAdmin@2026');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#047857] text-amber-300 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">এডমিন প্যানেল প্রবেশ</h2>
          <p className="text-xs text-slate-500">
            মেডি নার্সিং ভর্তি কোচিং যশোর • বই ও অর্ডার পরিচালনা
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            এডমিন লগইন
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('setup');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'setup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            নতুন এডমিন যোগ করুন
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'setup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                এডমিনের পুরো নাম
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="যেমন: ইঞ্জি. শরিফুল ইসলাম"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@medinursing.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-mono"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
              <button
                type="button"
                onClick={() => setShowDemoHelp(!showDemoHelp)}
                className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
              >
                <KeyRound className="w-3 h-3" />
                <span>পাসওয়ার্ড হেল্প</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#047857] to-[#064E3B] hover:from-[#064E3B] hover:to-[#047857] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'যাচাই করা হচ্ছে...' : mode === 'login' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'নতুন এডমিন সংরক্ষণ করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Helper Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>ডিফল্ট এডমিন তথ্য:</span>
            </span>
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="text-[11px] font-extrabold text-emerald-800 underline hover:text-emerald-950"
            >
              স্বয়ংক্রিয় পূরণ করুন
            </button>
          </div>
          <div className="font-mono text-[11px] space-y-0.5 bg-white/70 p-2 rounded-lg border border-amber-200/60">
            <p>ইমেইল: <span className="font-bold">admin@medinursing.com</span></p>
            <p>পাসওয়ার্ড: <span className="font-bold">MediAdmin@2026</span></p>
          </div>
          <p className="text-[10px] text-slate-500">
            * অথবা আপনি উপরে 'নতুন এডমিন যোগ করুন' ট্যাবে আপনার যেকোনো নিজস্ব ইমেইল ও পাসওয়ার্ড সেট করে নিতে পারেন।
          </p>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            ← মূল ওয়েবসাইটে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};
