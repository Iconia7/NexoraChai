'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle2, ArrowLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  if (!email) {
    return (
      <div className="text-center w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
        <p className="text-brand-muted mb-8">Please start the registration process again.</p>
        <Link href="/register" className="w-full bg-black text-white py-4 rounded-2xl inline-block font-bold uppercase text-xs tracking-widest transition-transform hover:scale-[1.02]">Back to Register</Link>
      </div>
    );
  }

  const handleResend = async () => {
    if (showPhoneInput && !phoneNumber) {
        addToast('Please enter your phone number', 'error');
        return;
    }
    
    setResending(true);
    try {
        await axios.post(`${BACKEND_URL}/api/auth/resend-otp`, { email, phoneNumber });
        addToast('Verification code resent!', 'success');
        setShowPhoneInput(false);
    } catch (err: any) {
        addToast(err.response?.data?.error || 'Failed to resend code', 'error');
    } finally {
        setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
        addToast('Please enter a 6-digit code', 'error');
        return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/verify-otp`, { email, otp });
      setSuccess(true);
      addToast('Account verified successfully!', 'success');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Verification failed', 'error');
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
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Verify Identity</h1>
            <p className="text-brand-muted font-medium">We've sent a 6-digit code to your phone. Enter it below to activate your account.</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-brand-beige-light px-4 py-2 rounded-full border border-black/5">
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" />
                <span className="text-xs font-bold text-black">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-4 block ml-1">Verification Code</label>
              <input 
                type="text"
                maxLength={6}
                required
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-brand-beige-light border-none rounded-[2rem] py-8 text-center text-5xl font-bold tracking-[0.5em] focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-brand-muted/10 shadow-inner"
              />
            </div>

            <button 
              disabled={loading || otp.length < 6}
              className="w-full btn-primary py-6 text-lg font-bold bg-[#914D00] shadow-xl shadow-brand-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : "Verify & Continue"}
            </button>
            
            <div className="space-y-4">
                {showPhoneInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest block ml-1">Update Phone Number</label>
                        <input 
                            type="tel"
                            placeholder="+254 700 000 000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="input-base py-3 px-6 text-sm font-bold"
                        />
                    </motion.div>
                )}
                
                <button 
                  type="button"
                  disabled={resending}
                  onClick={showPhoneInput ? handleResend : () => setShowPhoneInput(true)}
                  className="w-full text-center text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] hover:text-black transition-colors flex items-center justify-center gap-2"
                >
                  {resending ? <Loader2 size={12} className="animate-spin" /> : (showPhoneInput ? "Send to this number" : "Didn't receive a code? Update number")}
                </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-brand-beige-light p-12 rounded-[3.5rem] card-shadow border border-black/[0.03]"
        >
          <div className="w-24 h-24 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Verified!</h2>
          <p className="text-brand-muted font-medium mb-10 leading-relaxed">Your Nexora Chai account is now active. Redirecting you to login...</p>
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

export default function Verify() {
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
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-secondary mb-12 shadow-xl border border-white">
                            <Smartphone size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-4xl font-bold mb-8 leading-tight tracking-tight">
                            One last step to <br /><span className="text-brand-secondary">activate your journey.</span>
                        </h2>
                        <div className="bg-brand-beige-light p-8 rounded-[2.5rem] border border-black/[0.03] card-shadow">
                            <p className="text-brand-muted font-medium text-sm leading-relaxed mb-6">
                                "The SMS verification is instant. I love how Nexora keeps my account tied to my actual phone number."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                                    <Image src="/avatar-2.png" alt="Creator" width={48} height={48} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Amina Kariuki</p>
                                    <p className="text-xs text-brand-muted font-bold">Top Creator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-[10px] font-bold text-brand-muted uppercase tracking-widest opacity-50">
                    Global Verification Engine by AfricasTalking.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <Suspense fallback={<div className="font-bold uppercase tracking-widest text-brand-muted">Loading verification...</div>}>
                        <VerifyOTPContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
