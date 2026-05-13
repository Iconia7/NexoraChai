'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  if (!token) {
    return (
      <div className="text-center w-full max-w-sm mx-auto">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tight">Invalid Link</h1>
        <p className="text-brand-muted font-medium mb-10 leading-relaxed">This password reset link is invalid or has expired. Please request a new one.</p>
        <Link href="/forgot-password" className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest block hover:scale-[1.02] transition-transform">Request New Link</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password`, { token, newPassword: password });
      setSuccess(true);
      addToast('Password updated successfully!', 'success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!success ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Set New Password</h1>
            <p className="text-brand-muted font-medium">Choose a strong password to secure your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">New Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base text-lg font-medium py-4 pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[46px] text-brand-muted"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div>
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base text-lg font-medium py-4"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full btn-primary py-5 text-lg font-black bg-[#914D00] shadow-xl shadow-brand-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Update Password"}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-brand-secondary/5 p-12 rounded-[3.5rem] border border-brand-secondary/10"
        >
          <div className="w-24 h-24 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight">Success!</h2>
          <p className="text-brand-muted font-medium mb-10 leading-relaxed">Your password has been updated. Redirecting you to login...</p>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5 }}
                className="h-full bg-brand-secondary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen bg-white flex font-sans">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0C0C0C] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-20">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-primary rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-20">
                        <Image src="/logo.png" alt="Nexora Chai" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight text-white">Nexora Chai</span>
                    </div>

                    <div className="max-w-md">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white mb-12 border border-white/20">
                            <KeyRound size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-4xl font-black mb-8 leading-tight tracking-tight text-white">
                            Lock back in. <br /><span className="text-brand-primary">Secure your creator portal.</span>
                        </h2>
                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10">
                            <p className="text-white/60 font-medium text-sm leading-relaxed mb-6">
                                We use bank-grade encryption to ensure your new password and account access remain completely private.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-white text-xs font-black uppercase tracking-widest">End-to-End Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-[10px] font-black text-white/30 uppercase tracking-widest">
                    Authentication Infrastructure by ParsePesa API.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <Suspense fallback={<div className="font-black uppercase tracking-widest text-brand-muted">Loading...</div>}>
                        <ResetPasswordContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
