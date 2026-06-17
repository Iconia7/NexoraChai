'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Coffee,
    ArrowUpRight,
    Calendar,
    Filter,
    ShoppingBag,
    Heart,
    Sparkles,
    Lock,
    Building,
    Target
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function AnalyticsPage() {
    const { user, token } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard?range=${range}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error('Analytics fetch failed');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, router, range, mounted]);

    if (loading && !data) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Analytics...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light text-brand-muted font-bold">Error loading analytics</div>;

    return (
        <div className="h-screen bg-brand-beige-light flex font-sans overflow-hidden">
            <DashboardSidebar
                displayName={data.profile.displayName}
                username={data.profile.username}
                avatarUrl={data.profile.avatarUrl}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <MobileDashboardNav onOpenSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <DashboardHeader />

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Analytics</h1>
                            <p className="text-brand-muted font-medium text-sm md:text-base">Insights into your creator growth and earnings.</p>
                        </div>
                        <div className="flex gap-3 md:gap-4 w-full md:w-auto">
                            <div className="relative group flex-1 md:flex-initial">
                                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none z-10" />
                                <select
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                    className="appearance-none bg-white pl-10 pr-10 py-3 rounded-2xl border border-black/5 text-xs font-bold uppercase tracking-widest card-shadow hover:scale-[1.02] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                >
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 90 Days</option>
                                    <option value="all">All Time</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
                                    <ArrowUpRight size={14} className="rotate-90" />
                                </div>
                            </div>
                            <button
                                onClick={() => addToast("Advanced filters (by source, amount) are coming soon!", "info")}
                                className="bg-white p-3 rounded-2xl border border-black/5 card-shadow hover:scale-[1.05] active:scale-[0.95] transition-all group"
                            >
                                <Filter size={18} className="text-brand-muted group-hover:text-brand-primary transition-colors" />
                            </button>
                        </div>
                    </header>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {[
                            { label: 'Total Chais', value: (data.stats?.totalChais || 0).toLocaleString(), delta: '+12%', icon: Coffee, color: 'text-brand-primary' },
                            { label: 'Profile Views', value: (data.stats?.views || 0).toLocaleString(), delta: '+8%', icon: Users, color: 'text-brand-secondary' },
                            { label: 'Conversion', value: `${data.stats?.conversion || 0}%`, delta: '+0.5%', icon: TrendingUp, color: 'text-green-500' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-[2.5rem] card-shadow border border-black/[0.02]"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl bg-brand-beige-light flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">{stat.delta}</span>
                                </div>
                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">{stat.label}</p>
                                <h2 className="text-4xl font-bold tracking-tight">{stat.value}</h2>
                            </motion.div>
                        ))}
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] card-shadow border border-black/[0.02] mb-12">
                        <h3 className="text-lg font-bold tracking-tight mb-8">Earnings by Channel</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(() => {
                                const breakdown = data.revenueBreakdown || {
                                    TIP: 0,
                                    GOAL: 0,
                                    PRODUCT: 0,
                                    MEMBERSHIP: 0,
                                    COMMISSION: 0,
                                    POST_UNLOCK: 0,
                                    ORGANIZATION_CAMPAIGN: 0
                                };
                                const total = Object.values(breakdown).reduce((a: number, b: any) => a + Number(b), 0) || 1;

                                const channels = [
                                    { label: 'Direct Tips', value: Number(breakdown.TIP), icon: Coffee, color: 'text-amber-600 bg-amber-500/10' },
                                    { label: 'Support Goals', value: Number(breakdown.GOAL), icon: Target, color: 'text-indigo-600 bg-indigo-500/10' },
                                    { label: 'Digital Products', value: Number(breakdown.PRODUCT), icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-500/10' },
                                    { label: 'Memberships', value: Number(breakdown.MEMBERSHIP), icon: Heart, color: 'text-rose-600 bg-rose-500/10' },
                                    { label: 'Commissions', value: Number(breakdown.COMMISSION), icon: Sparkles, color: 'text-purple-600 bg-purple-500/10' },
                                    { label: 'Post Unlocks', value: Number(breakdown.POST_UNLOCK), icon: Lock, color: 'text-cyan-600 bg-cyan-500/10' },
                                    { label: 'Campaign Contributions', value: Number(breakdown.ORGANIZATION_CAMPAIGN), icon: Building, color: 'text-blue-600 bg-blue-500/10' }
                                ].filter(c => c.value > 0 || c.label === 'Direct Tips');

                                return channels.map((c, i) => {
                                    const pct = Math.min(100, Math.round((c.value / total) * 100));
                                    return (
                                        <div key={i} className="p-6 rounded-3xl bg-brand-beige-light/35 border border-black/[0.01]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${c.color}`}>
                                                    <c.icon size={20} />
                                                </div>
                                                <span className="text-[10px] font-bold text-brand-muted">{pct}% of total</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{c.label}</p>
                                            <h4 className="text-xl font-bold tracking-tight mb-3">KES {c.value.toLocaleString()}</h4>
                                            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-primary animate-pulse" style={{ width: `${pct}%`, backgroundColor: c.color.split(' ')[0] === 'text-amber-600' ? '#914D00' : undefined }} />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="bg-[#0C0C0C] rounded-[3rem] p-10 text-white shadow-2xl mb-12 overflow-hidden relative">
                        <div className="flex justify-between items-center mb-12 relative z-10">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold tracking-tight">Support Growth</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Monthly performance</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar -mx-2">
                            <div className="h-[300px] flex items-end gap-3 md:gap-4 relative z-10 min-w-[600px] px-2">
                                {(() => {
                                    const months = (data.monthlyGrowth || Array(12).fill(0));
                                    const maxVal = Math.max(...months, 1);
                                    const monthLabels = Array.from({ length: 12 }, (_, i) => {
                                        const d = new Date();
                                        d.setMonth(d.getMonth() - (11 - i));
                                        return d.toLocaleString('default', { month: 'short' })[0];
                                    });

                                    return months.map((val: number, i: number) => {
                                        const h = (val / maxVal) * 100;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max(h, 2)}%` }}
                                                    className="w-full bg-gradient-to-t from-brand-primary/20 to-brand-primary rounded-t-xl relative group"
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded-md text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                                                        KES {val.toLocaleString()}
                                                    </div>
                                                </motion.div>
                                                <span className="text-[10px] font-bold text-white/20">{monthLabels[i]}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px]" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Supporters */}
                        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-black/[0.02]">
                            <h3 className="text-lg font-bold tracking-tight mb-8">Top Supporters</h3>
                            <div className="space-y-6">
                                {(data.topSupporters || []).map((s: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-brand-beige-light flex items-center justify-center font-bold text-brand-primary uppercase">{s.name[0]}</div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{s.name}</p>
                                                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">{s.chais} Chais bought</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-brand-secondary text-sm">{s.value}</p>
                                    </div>
                                ))}
                                {(!data.topSupporters || data.topSupporters.length === 0) && (
                                    <p className="text-center text-brand-muted py-10 font-bold">No supporters in this range.</p>
                                )}
                            </div>
                        </div>

                        {/* Support Sources */}
                        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-black/[0.02]">
                            <h3 className="text-lg font-bold tracking-tight mb-8">Support Sources</h3>
                            <div className="space-y-6">
                                {(data.supportSources || []).map((source: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold tracking-tight">{source.label}</span>
                                            <span className="text-xs font-bold">{source.percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${source.percentage}%` }}
                                                className={`h-full ${source.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!data.supportSources || data.supportSources.length === 0) && (
                                    <p className="text-center text-brand-muted py-10 font-bold">No data for this range.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
