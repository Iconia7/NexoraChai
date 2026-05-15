'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldQuestion } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, { email });
      setSubmitted(true);
      addToast('Reset link sent to your email', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-beige p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-primary rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <Image src="/logo.png" alt="Nexora Chai" width={32} height={32} />
            <span className="font-bold text-xl tracking-tight">Nexora Chai</span>
          </div>

          <div className="max-w-md">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-primary mb-12 shadow-xl">
              <ShieldQuestion size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-bold mb-8 leading-tight tracking-tight text-brand-primary">
              Your security is our priority. Recover your account safely.
            </h2>
            <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/40 shadow-sm">
                <p className="font-bold text-sm text-brand-muted italic">
                    "The recovery process was seamless. I was back on my dashboard in less than 2 minutes."
                </p>
                <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs uppercase">
                        JM
                    </div>
                    <div>
                        <p className="font-bold text-xs">James Mwangi</p>
                        <p className="text-[10px] text-brand-muted font-bold uppercase">verified creator</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-bold text-brand-muted uppercase tracking-widest opacity-50">
          Global Security Infrastructure by ParsePesa.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Link href="/login" className="flex items-center gap-2 text-brand-muted hover:text-black transition-colors mb-12 font-bold text-sm">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-10">
                  <h1 className="text-4xl font-bold mb-3 tracking-tight">Forgot Password?</h1>
                  <p className="text-brand-muted font-medium">No worries! Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted/40" size={20} />
                      <input 
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-base text-lg font-medium py-4 pl-14"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full btn-primary py-5 text-lg font-bold bg-[#914D00] shadow-xl shadow-brand-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Send Reset Link"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-brand-beige-light p-10 rounded-[3rem] card-shadow border border-black/[0.03]"
              >
                <div className="w-20 h-20 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-3 tracking-tight">Check your email</h2>
                <p className="text-brand-muted font-medium mb-8 leading-relaxed">We've sent a password reset link to <br /><span className="text-black font-bold">{email}</span>.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-brand-primary font-bold uppercase tracking-widest text-[10px] hover:underline"
                >
                  Didn't receive it? Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
