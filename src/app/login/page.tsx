'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);

  const [rememberMe, setRememberMe] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loginUserId, setLoginUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      
      if (res.data.requires2FA) {
          setRequires2FA(true);
          setLoginUserId(res.data.userId);
          addToast('Two-Factor Authentication required', 'info');
          setLoading(false);
          return;
      }

      setAuth(res.data.user, res.data.token);
      addToast('Welcome back!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.unverified) {
          addToast('Account not verified. Redirecting...', 'info');
          router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
          addToast(err.response?.data?.error || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNexoraLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_NEXORA_CLIENT_ID;
    const authUrl = process.env.NEXT_PUBLIC_NEXORA_ID_URL;
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
    const state = Math.random().toString(36).substring(7);
    
    // Save state to verify it on callback
    localStorage.setItem('nexora_auth_state', state);

    window.location.href = `${authUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&state=${state}`;
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await axios.post(`${BACKEND_URL}/api/auth/2fa/verify-login`, { 
            userId: loginUserId, 
            code: twoFactorCode 
        });
        setAuth(res.data.user, res.data.token);
        addToast('Login successful!', 'success');
        router.push('/dashboard');
    } catch (err: any) {
        addToast(err.response?.data?.error || 'Invalid 2FA code', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-beige p-12 items-center justify-center">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="Nexora Chai Logo" width={40} height={40} className="rounded-xl shadow-lg" />
              <h2 className="text-brand-primary font-black text-2xl tracking-tight">Nexora Chai</h2>
            </div>
            <div className="relative aspect-square rounded-[3rem] overflow-hidden card-shadow mb-12">
              <Image
                src="/login-visual.png"
                alt="Nexora Chai Visual"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="bg-brand-beige-light p-8 rounded-[2.5rem] card-shadow">
            <p className="text-lg font-medium text-brand-muted mb-6 leading-relaxed">
              "Finally, a fintech platform built for how African creators actually operate. Beautiful, fast, and completely intuitive."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                <Image src="/avatar-1.png" alt="Amara N." width={48} height={48} />
              </div>
              <div>
                <p className="font-bold text-sm">Amara N.</p>
                <p className="text-xs text-brand-muted font-bold">Digital Artist</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3 tracking-tight">
                {requires2FA ? 'Verification' : 'Welcome Back'}
            </h1>
            <p className="text-brand-muted font-medium">
                {requires2FA ? 'Enter the 6-digit code from your app.' : 'Log in to manage your creativity and finances.'}
            </p>
          </div>

          {!requires2FA ? (
              <>
                <button 
                    onClick={handleNexoraLogin}
                    className="w-full border border-black/10 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-black/[0.02] transition-colors mb-8"
                >
                    <Zap size={20} className="text-brand-primary fill-brand-primary" /> Sign in with Nexora ID
                </button>

                <div className="relative mb-8 text-center">
                    <span className="bg-white px-4 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] relative z-10">Or continue with email</span>
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/5" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 rounded-[6px] border-2 border-black/10 text-brand-primary focus:ring-transparent transition-all cursor-pointer group-hover:border-black/30" 
                        />
                        <span className="font-bold text-black tracking-tight">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors">Forgot password?</Link>
                    </div>

                    <button
                    disabled={loading}
                    className="w-full btn-primary py-5 text-lg font-black bg-[#914D00] shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                    >
                    {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
              </>
          ) : (
              <form onSubmit={handle2FAVerify} className="space-y-8 text-center">
                  <div className="flex justify-center">
                      <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                          <Lock size={40} />
                      </div>
                  </div>
                  
                  <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="w-full text-center text-5xl font-black tracking-[0.5em] py-6 border-2 border-black/5 rounded-3xl outline-none focus:border-brand-primary transition-colors"
                  />

                  <button
                    disabled={loading || twoFactorCode.length !== 6}
                    className="w-full btn-primary py-5 text-lg font-black bg-[#914D00] shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="text-brand-muted font-bold text-sm hover:underline"
                  >
                      Back to login
                  </button>
              </form>
          )}

          <p className="text-center mt-12 text-brand-muted font-bold text-sm">
            Don't have an account? <Link href="/register" className="text-brand-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
