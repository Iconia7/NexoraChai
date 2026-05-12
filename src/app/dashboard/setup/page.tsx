'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, AtSign, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function OnboardingSetup() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  const handleFinish = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/creators/setup`, 
        { username, displayName, bio, mpesaNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(3);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A15] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black mb-8">Personalize your page</h1>
            <div className="glass-card p-10 rounded-[2.5rem] space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    placeholder="e.g. Newton Nderitu"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full glass py-4 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Unique Username</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    placeholder="e.g. newton"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="w-full glass py-4 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 font-bold"
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-accent text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black mb-8">Payout Details</h1>
            <div className="glass-card p-10 rounded-[2.5rem] space-y-6">
              <p className="text-slate-400 mb-6">Enter your M-Pesa number. We use this to create your Paystack Subaccount for automatic payouts.</p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">M-Pesa Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    placeholder="e.g. 254712345678"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full glass py-4 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Short Bio</label>
                <textarea 
                  placeholder="What are you creating?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full glass py-4 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 font-medium min-h-[120px]"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 glass py-5 rounded-2xl font-bold">Back</button>
                <button 
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-[2] bg-accent text-black py-5 rounded-2xl font-black text-lg disabled:opacity-50"
                >
                  {loading ? "Finishing..." : "Complete Setup"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-black mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-4xl font-black mb-4">You're all set!</h1>
            <p className="text-slate-400">Redirecting to your dashboard...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
