'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email,
        password,
        phoneNumber
      });
      addToast('Verification code sent to your phone!', 'success');
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F3E5D8] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-primary rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20 text-[#0C0C0C]">
            <Image src="/logo.png" alt="Nexora Chai" width={40} height={40} className="rounded-xl shadow-lg" />
            <span className="font-bold text-xl tracking-tight">Nexora Chai</span>
          </div>

          <div className="max-w-md">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-secondary mb-12 shadow-xl">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-black mb-8 leading-tight tracking-tight text-[#0C0C0C]">
              "Joining Nexora Chai is the smartest financial decision I made this year."
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <Image src="/avatar-2.png" alt="Amina Kariuki" width={48} height={48} />
              </div>
              <div>
                <p className="font-bold text-sm text-[#0C0C0C]">Amina Kariuki</p>
                <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Top Creator, Nairobi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-black text-brand-muted uppercase tracking-widest opacity-50">
          Securely powered by Nexora Creative Solutions Infrastructure.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-brand-beige-light md:bg-white">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Claim Your Space</h1>
            <p className="text-brand-muted font-medium">Your Nexora ID connects you to ParsePesa API, Nexora Menu and Nexora POS too.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Phone Number (M-Pesa)</label>
              <input
                type="tel"
                required
                placeholder="+254 700 000 000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-base text-lg font-medium py-4"
              />
            </div>

            <div>
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base text-lg font-medium py-4"
              />
            </div>

            <div className="relative">
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Password</label>
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

            <button
              disabled={loading}
              className="w-full btn-primary py-5 text-lg font-black bg-[#914D00] shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create My Creator Account"} <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center mt-12 text-brand-muted font-bold text-sm">
            Already have an account? <Link href="/login" className="text-brand-primary hover:underline">Log in here</Link>
          </p>

          <div className="mt-12 text-center text-[10px] text-brand-muted leading-relaxed font-bold">
            By registering, you agree to the <Link href="/terms" className="underline">Terms of Service</Link> and<br />
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
