'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, Github } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, { email, password });
      setAuth(res.data.user, res.data.token);
      router.push('/dashboard/setup'); // Send to onboarding setup
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A15] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-black font-black text-3xl shadow-2xl shadow-accent/20">N</div>
          </Link>
          <h1 className="text-3xl font-black mb-3">Create your account</h1>
          <p className="text-slate-400">Join the Nexora Chai creator network.</p>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass py-4 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass py-4 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 font-medium transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-accent text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-accent/20 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Start Building"} <ArrowRight size={20} />
            </button>
          </form>

          <div className="relative my-8 text-center">
            <span className="bg-[#0D1525] px-4 text-xs font-bold text-slate-600 uppercase tracking-widest relative z-10">Or continue with</span>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="glass py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/5 transition-colors">
              <Github size={20} /> Github
            </button>
            <button className="glass py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/5 transition-colors">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] text-black">G</div> Google
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-400 font-medium">
          Already have an account? <Link href="/login" className="text-accent hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}
