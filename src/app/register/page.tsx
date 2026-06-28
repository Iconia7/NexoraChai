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
      {/* Left Panel - Decorative Background */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        <Image
          src="/talent-jar-hero.png"
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
            <h2 className="text-2xl font-bold mb-6 leading-tight tracking-tight text-white animate-fade-in">
              "Joining Talent Jar is the smartest financial decision I made this year."
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                <Image src="/avatar-2.png" alt="Amina Kariuki" width={48} height={48} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Amina Kariuki</p>
                <p className="text-xs text-white/60 font-bold uppercase tracking-wider">Top Creator, Nairobi</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Securely powered by Nexora Creative Solutions Infrastructure.
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-brand-beige-light md:bg-white">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Claim Your Space</h1>
            <p className="text-brand-muted font-medium">Your Nexora ID connects you to ParsePesa API, Nexora Menu and Nexora POS too.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Phone Number (M-Pesa)</label>
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
              <label className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Email Address</label>
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
              <label className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Password</label>
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
              className="w-full btn-primary py-5 text-lg font-bold bg-[#914D00] shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
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
