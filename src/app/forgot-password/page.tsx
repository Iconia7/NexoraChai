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
      {/* Left Panel - Decorative Background */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        <Image
          src="/login-visual.png"
          alt="Talent Jar Hero"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 z-10" />

        <div className="relative z-20 flex flex-col h-full justify-between">
          <div>
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Talent Jar Logo" width={180} height={60} className="object-contain h-16 w-auto brightness-0 invert" />
            </Link>
          </div>

          <div className="max-w-md bg-black/45 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 leading-tight tracking-tight text-white">
              Your security is our priority. Recover your account safely.
            </h2>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <p className="font-bold text-xs text-white/70 italic">
                    "The recovery process was seamless. I was back on my dashboard in less than 2 minutes."
                </p>
                <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs uppercase">
                        JM
                    </div>
                    <div>
                        <p className="font-bold text-xs text-white">James Mwangi</p>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">verified creator</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Global Security Infrastructure by ParsePesa.
          </div>
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
