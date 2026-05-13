'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    BarChart3,
    Wallet,
    Settings,
    Bell,
    ArrowUpRight,
    ArrowRight,
    Plus,
    Copy,
    TrendingUp,
    Globe,
    Radio
} from 'lucide-react';
import axios from 'axios';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Dashboard() {
    const { user, token } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

        const fetchDashboard = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
                // If profile exists but Paystack subaccount is missing, redirect to setup
                if (!res.data.profile?.paystackSubaccountCode) {
                    router.push('/dashboard/setup');
                }
            } catch (err: any) {
                // If profile doesn't exist, redirect to setup
                if (err.response?.status === 404) {
                    router.push('/dashboard/setup');
                } else {
                    console.error('Dashboard fetch failed');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [token, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Dashboard...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light text-brand-muted font-bold">Error loading dashboard</div>;

    return (
        <div className="min-h-screen bg-brand-beige-light flex flex-col lg:flex-row font-sans">
            <DashboardSidebar
                displayName={data.profile.displayName}
                username={data.profile.username}
                avatarUrl={data.profile.avatarUrl}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <MobileDashboardNav onOpenSidebar={() => setSidebarOpen(true)} />

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <DashboardHeader />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Balance Card */}
                        <div className="lg:col-span-2 bg-[#0C0C0C] rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-2xl">
                            <div className="relative z-10">
                                <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">Available M-Pesa Balance</p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">KES {(data.wallet?.balance || 0).toLocaleString()}.00</h1>
                                <div className="flex items-center gap-2 text-brand-secondary font-bold text-xs md:text-sm">
                                    <TrendingUp size={16} />
                                    <span>Total Earnings: KES {(data.totalEarnings || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="relative z-10 flex justify-start">
                                <Link href="/dashboard/earnings" className="bg-[#00E676] text-black px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#00C853] transition-colors shadow-lg shadow-[#00E676]/20">
                                    <Wallet size={16} /> Withdraw to M-Pesa
                                </Link>
                            </div>

                            {/* Decoration */}
                            <div className="absolute top-1/2 right-[-5%] w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
                            <div className="absolute bottom-[-10%] right-10 opacity-10">
                                <Wallet size={120} />
                            </div>
                        </div>

                        {/* International Tips */}
                        <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-black/[0.02] flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-brand-beige-light flex items-center justify-center text-brand-primary">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm tracking-tight">International Card Tips</p>
                                    <p className="text-[10px] font-bold text-brand-muted uppercase">Via Paystack</p>
                                </div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tight mb-8">KES {(data.paystackTotal || 0).toLocaleString()}.00</h2>
                            <Link href="/dashboard/earnings" className="w-full border border-black/10 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black/[0.02] transition-colors mt-auto">
                                Manage Payouts <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Support */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 card-shadow border border-black/[0.02]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black tracking-tight">Recent Support</h2>
                                <Link href="/dashboard/earnings" className="text-brand-primary text-xs font-black uppercase tracking-widest hover:underline">View All</Link>
                            </div>
                            <div className="space-y-6">
                                {data.transactions
                                    .filter((t: any) => t.type === 'TIP' && t.status === 'COMPLETED')
                                    .slice(0, 6)
                                    .map((t: any) => (
                                        <div key={t.id} className="flex items-center justify-between p-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-beige-light flex items-center justify-center font-black text-brand-primary uppercase">
                                                    {t.fanName?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{t.fanName || 'A Supporter'} ☕</p>
                                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Buy me a Chai</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <p className="font-black text-brand-secondary text-sm md:text-base">KES {t.netAmount.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-brand-muted opacity-50 uppercase tracking-widest">
                                                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(t.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                {data.transactions.length === 0 && (
                                    <p className="text-center text-brand-muted py-10 font-bold">No transactions yet. Share your link!</p>
                                )}
                            </div>
                        </div>

                        {/* Referral/Action Card */}
                        <div className="bg-brand-primary rounded-[2.5rem] p-8 text-white card-shadow flex flex-col justify-between bg-[#914D00] min-h-[450px]">
                            <div>
                                <h3 className="text-xl font-black tracking-tight mb-4">Share your page</h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-8">Let your fans know they can support your work directly via M-Pesa.</p>

                                <div className="bg-black/20 rounded-xl p-4 flex items-center justify-between border border-white/10 mb-8">
                                    <span className="text-xs font-bold truncate pr-4">chai.nexoracreatives.co.ke/{data.profile.username}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://chai.nexoracreatives.co.ke/${data.profile.username}`);
                                            addToast("Link copied to clipboard!", "success");
                                        }}
                                        className="text-white hover:text-brand-secondary transition-colors shrink-0"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>

                                {/* QR Code Display */}
                                <div className="bg-white p-4 rounded-3xl w-40 h-40 mx-auto mb-8 shadow-2xl flex items-center justify-center">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chai.nexoracreatives.co.ke/${data.profile.username}`}
                                        alt="QR Code"
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://chai.nexoracreatives.co.ke/${data.profile.username}`;
                                    const response = await fetch(url);
                                    const blob = await response.blob();
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(blob);
                                    link.download = `nexora-qr-${data.profile.username}.png`;
                                    link.click();
                                    addToast("Downloading QR Code...", "info");
                                }}
                                className="w-full bg-white text-brand-primary py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl shadow-black/10"
                            >
                                Get QR Code
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
