'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Heart, Zap, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function CreatorPage() {
  const { username } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/${username}`);
        setCreator(res.data);
      } catch (err) {
        console.error('Creator not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [username]);

  const handleSupport = async () => {
    // This will eventually open the Paystack modal
    alert(`Supporting ${creator.displayName} with KES ${amount}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!creator) return <div className="min-h-screen flex items-center justify-center">Creator not found</div>;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-3xl overflow-hidden glass-card p-1">
              <img 
                src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                alt={creator.displayName}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground p-1.5 rounded-xl shadow-lg">
              <Zap size={16} fill="currentColor" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 tracking-tight">{creator.displayName}</h1>
          <p className="text-muted-foreground mb-6">@{creator.username}</p>
          <p className="text-lg leading-relaxed text-slate-300 max-w-lg mx-auto">
            {creator.bio || "Supporting the next generation of African creators."}
          </p>
        </motion.div>

        {/* Support Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[2.5rem] p-8 mb-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <Coffee size={24} />
            </div>
            <h2 className="text-xl font-bold">Buy {creator.displayName} a Chai</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[100, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`py-4 rounded-2xl font-bold transition-all ${
                  amount === val 
                    ? 'bg-accent text-accent-foreground shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'glass hover:bg-white/5'
                }`}
              >
                KES {val}
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <input 
              type="number"
              placeholder="Other amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full glass rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 font-bold"
            />
          </div>

          <textarea
            placeholder="Say something nice (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full glass rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[120px] mb-8 resize-none"
          />

          <button 
            onClick={handleSupport}
            className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-accent/20"
          >
            <Heart size={20} fill="currentColor" />
            Support KES {amount.toLocaleString()}
          </button>
          
          <p className="text-center mt-6 text-xs text-muted-foreground uppercase tracking-widest font-bold">
            ⚡ Powered by ParsePesa API
          </p>
        </motion.div>

        {/* Supporters List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Recent Supporters</h3>
          {creator.transactions && creator.transactions.length > 0 ? (
            creator.transactions.map((t: any) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-5 rounded-2xl flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-blue-500/20 flex items-center justify-center font-bold text-accent">
                  {t.fanName?.[0] || 'F'}
                </div>
                <div>
                  <p className="font-bold">{t.fanName || 'A Fan'} bought a chai</p>
                  {t.fanMessage && <p className="text-slate-400 text-sm mt-1">{t.fanMessage}</p>}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground italic">Be the first to support!</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-glass-border mt-20">
        <div className="max-w-2xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm font-medium">© 2026 Nexora Chai · Africa's Creator Economy 🇰🇪</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors"><ExternalLink size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
