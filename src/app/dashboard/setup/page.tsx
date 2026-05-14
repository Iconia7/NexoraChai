'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function OnboardingSetup() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [bio, setBio] = useState('');
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token } = useAuthStore();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push('/login');
      return;
    }
  }, [token, router, mounted]);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/check-username/${username}`);
        setIsAvailable(res.data.available);
      } catch (err) {
        console.error('Check failed');
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/creators/upload-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setAvatarUrl(res.data.avatarUrl);
    } catch (err) {
      console.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = async () => {
    if (!isAvailable) {
      addToast('Please choose an available username', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/creators/setup`,
        { username, displayName, bio, mpesaNumber, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(3);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Setup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige-light font-sans">
      {/* Header */}
      <header className="h-20 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Nexora Chai" width={24} height={24} />
          <span className="font-bold tracking-tight">Nexora Chai</span>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">
          <span className={step === 1 ? 'text-brand-primary' : ''}>1. Profile</span>
          <ChevronRight size={12} />
          <span className={step === 2 ? 'text-brand-primary' : ''}>2. Money</span>
          <ChevronRight size={12} />
          <span className={step === 3 ? 'text-brand-primary' : ''}>3. Verify</span>
        </nav>

        <button className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary">Save & Exit</button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 flex justify-center">
        <div className="max-w-2xl w-full">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white p-12 rounded-[3rem] card-shadow border border-black/[0.02] text-center">
                <h1 className="text-3xl font-black mb-3 tracking-tight">Set up your creator profile</h1>
                <p className="text-brand-muted font-medium mb-12">Let your supporters know who they are tipping.</p>

                <div className="flex justify-center mb-12">
                  <div
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    className="w-32 h-32 rounded-full border-2 border-dashed border-brand-primary/30 bg-brand-primary/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-brand-primary/10 transition-colors group overflow-hidden relative"
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <>
                        <Camera size={32} className="text-brand-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{uploading ? 'Uploading...' : 'Upload'}</span>
                      </>
                    )}
                  </div>
                  <input
                    id="avatar-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="space-y-6 text-left max-w-md mx-auto">
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Display Name</label>
                    <input
                      placeholder="e.g. Wanjiku's Kitchen"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input-base text-lg font-medium py-4"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Unique Username</label>
                    <div className="flex items-center gap-2 bg-[#F9FAFB] border border-black/10 rounded-2xl px-4 py-4">
                      <span className="text-brand-muted font-bold text-sm">chai.nexoracreatives.co.ke/</span>
                      <input
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="flex-1 bg-transparent border-none focus:outline-none font-bold text-sm"
                      />
                    </div>
                    {username.length >= 3 && (
                      <div className="mt-2 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        {checking ? (
                          <span className="text-brand-muted">Checking...</span>
                        ) : isAvailable ? (
                          <span className="text-brand-secondary flex items-center gap-1"><CheckCircle2 size={12} /> Available</span>
                        ) : (
                          <span className="text-red-500 font-bold">Username already taken</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Short Bio</label>
                    <textarea
                      placeholder="I create awesome content about..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="input-base text-lg font-medium py-4 min-h-[140px] resize-none"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full btn-primary py-5 text-lg font-black bg-[#914D00] shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 mt-8"
                  >
                    Continue to Payment Info <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white p-12 rounded-[3rem] card-shadow border border-black/[0.02] text-center">
                <h1 className="text-3xl font-black mb-3 tracking-tight">Payout Details</h1>
                <p className="text-brand-muted font-medium mb-12">Enter your M-Pesa number for automatic payouts.</p>

                <div className="space-y-6 text-left max-w-md mx-auto">
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">M-Pesa Number</label>
                    <input
                      placeholder="e.g. 254712345678"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      className="input-base text-lg font-medium py-4"
                    />
                    <p className="text-[10px] text-brand-muted mt-3 font-bold">We use this to create your Paystack Subaccount.</p>
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button onClick={() => setStep(1)} className="flex-1 border border-black/10 py-5 rounded-2xl font-bold hover:bg-black/[0.02] transition-colors">Back</button>
                    <button
                      onClick={handleFinish}
                      disabled={loading}
                      className="flex-[2] btn-primary py-5 text-lg font-black bg-[#914D00] shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                    >
                      {loading ? "Finishing..." : "Complete Setup"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-32 h-32 bg-brand-secondary rounded-full flex items-center justify-center text-white mx-auto mb-12 shadow-2xl">
                <CheckCircle2 size={64} />
              </div>
              <h1 className="text-4xl font-black mb-4 tracking-tight">You're all set!</h1>
              <p className="text-brand-muted font-medium">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
