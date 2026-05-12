'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare, 
  ArrowUpRight,
  Download,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch failed');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Error loading dashboard</div>;

  const stats = [
    { label: 'Total Earnings', value: `KES ${data.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-accent' },
    { label: 'Total Supporters', value: data.transactions.length, icon: Users, color: 'text-blue-400' },
    { label: 'Avg. Support', value: `KES ${(data.totalEarnings / (data.transactions.length || 1)).toFixed(0)}`, icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#050A15] text-slate-200">
      <nav className="border-b border-white/5 bg-[#050A15]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black font-black">N</div>
            <span className="font-bold tracking-tight">Nexora Chai</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium hover:text-accent transition-colors">Docs</button>
            <div className="w-10 h-10 rounded-full glass border border-white/10" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {data.profile.displayName}</h1>
            <p className="text-slate-400">Here's what's happening with your chai support.</p>
          </div>
          <div className="flex gap-4">
            <button className="glass px-6 py-3 rounded-xl flex items-center gap-2 font-medium hover:bg-white/5 transition-colors">
              <Download size={18} />
              Export CSV
            </button>
            <button className="bg-accent text-black px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-accent/20">
              <ArrowUpRight size={18} />
              View Page
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2rem]"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <p className="text-slate-400 font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Support</h2>
              <button className="text-accent text-sm font-bold">View All</button>
            </div>
            {data.transactions.map((t: any) => (
              <div key={t.id} className="glass p-6 rounded-3xl flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center font-bold text-accent">
                    {t.fanName?.[0] || 'F'}
                  </div>
                  <div>
                    <p className="font-bold">{t.fanName || 'Anonymous Fan'}</p>
                    <p className="text-slate-400 text-sm">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">+ KES {t.netToCreator}</p>
                  <p className="text-slate-500 text-xs">Fee: KES {t.nexoraFee}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions / Settings */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="glass-card p-6 rounded-[2rem] space-y-4">
              <button className="w-full glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MessageSquare size={20} />
                </div>
                <span className="font-bold">Edit Bio & Tiers</span>
              </button>
              <button className="w-full glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Settings size={20} />
                </div>
                <span className="font-bold">Payout Settings</span>
              </button>
            </div>

            {/* Share Link */}
            <div className="bg-accent/5 border border-accent/20 p-8 rounded-[2.5rem]">
              <h4 className="text-accent font-bold mb-2">Share your link</h4>
              <p className="text-slate-400 text-sm mb-6">Let your fans know they can support your work.</p>
              <div className="glass p-4 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-mono text-accent truncate mr-4">nexora.chai/@{data.profile.username}</span>
                <button className="text-xs font-black uppercase text-accent">Copy</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
