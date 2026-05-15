'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    CreditCard,
    Plus,
    ArrowRight,
    TrendingUp,
    History,
    Settings
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';
import { useToastStore } from '@/lib/toastStore';
import Link from 'next/link';

import WithdrawalModal from '@/components/WithdrawalModal';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function EarningsPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const addToast = useToastStore((state) => state.addToast);
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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
            try {
                const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error('Earnings fetch failed');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, router, mounted]);

    const refreshData = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error('Refresh failed');
        }
    };

    const handleExportCSV = () => {
        if (!data.transactions || data.transactions.length === 0) {
            addToast("No transactions to export", "info");
            return;
        }

        const headers = ["Date", "Fan Name", "Type", "Amount", "Status"];
        const rows = data.transactions.map((t: any) => [
            new Date(t.createdAt).toLocaleDateString(),
            t.fanName || "A Supporter",
            t.type,
            t.netAmount,
            t.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `nexora-earnings-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        addToast("Exporting transactions...", "success");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light font-bold uppercase tracking-widest text-brand-muted">Loading Earnings...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light text-brand-muted font-bold">Error loading earnings</div>;

    return (
        <div className="min-h-screen bg-brand-beige-light flex font-sans">
            <DashboardSidebar
                displayName={data.profile.displayName}
                username={data.profile.username}
                avatarUrl={data.profile.avatarUrl}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <MobileDashboardNav onOpenSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-8 overflow-y-auto">
                    <DashboardHeader />

                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Earnings</h1>
                            <p className="text-brand-muted font-medium">Manage your wallet and withdraw your creator funds.</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="bg-white px-5 py-3 rounded-2xl border border-black/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest card-shadow hover:scale-[1.02] transition-transform"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </header>

                    {/* Main Wallet Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2 bg-[#0C0C0C] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Available M-Pesa Balance</p>
                                        <h2 className="text-6xl font-bold tracking-tight">KES {(data.wallet?.balance || 0).toLocaleString()}.00</h2>
                                    </div>
                                    <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl">
                                        <Wallet size={32} className="text-[#00E676]" />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center">
                                    <button
                                        onClick={() => setIsWithdrawModalOpen(true)}
                                        className="bg-[#00E676] text-black px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00C853] transition-all hover:scale-[1.02] shadow-xl shadow-[#00E676]/20"
                                    >
                                        Withdraw to M-Pesa <ArrowUpRight size={18} />
                                    </button>
                                    <Link href="/dashboard/settings" className="bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md flex items-center justify-center gap-2">
                                        Wallet Settings <Settings size={18} />
                                    </Link>
                                </div>
                            </div>

                            {/* Decoration */}
                            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px]" />
                        </div>

                        {/* Paystack Summary */}
                        <div className="bg-white rounded-[3rem] p-10 card-shadow border border-black/[0.02] flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-brand-beige-light text-brand-primary flex items-center justify-center mb-6">
                                    <CreditCard size={24} />
                                </div>
                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">International (Paystack)</p>
                                <h3 className="text-4xl font-bold tracking-tight mb-4">KES {(data.paystackTotal || 0).toLocaleString()}.00</h3>
                                <p className="text-xs font-bold text-brand-muted leading-relaxed">Automatically settled to your bank via Paystack Split.</p>
                            </div>
                            <button
                                onClick={() => addToast("Login to your Paystack Dashboard to view detailed card settlements.", "info")}
                                className="w-full mt-8 flex items-center justify-between text-brand-primary font-bold uppercase tracking-widest text-xs group"
                            >
                                Manage Paystack Payouts <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-[3rem] p-10 card-shadow border border-black/[0.02]">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <History size={24} className="text-brand-muted" />
                                <h3 className="text-xl font-bold tracking-tight">Transaction History</h3>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {data.transactions.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-brand-beige-light/50 rounded-2xl transition-colors border border-transparent hover:border-black/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-500' : 'bg-brand-beige-light text-brand-secondary'}`}>
                                            {t.type === 'WITHDRAWAL' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{t.type === 'WITHDRAWAL' ? 'Withdrawal to M-Pesa' : (t.fanName || 'A Supporter') + ' ☕'}</p>
                                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                                {t.type === 'WITHDRAWAL' ? 'M-Pesa Transfer' : 'Support Chai'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold tracking-tight text-lg ${t.status === 'COMPLETED' ? (t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-brand-secondary') : 'text-brand-muted opacity-40'}`}>
                                            {t.type === 'WITHDRAWAL' ? '-' : '+'} KES {t.netAmount.toLocaleString()}
                                        </p>
                                        <div className="flex items-center justify-end gap-2">
                                            {t.status !== 'COMPLETED' && (
                                                <span className={`text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${t.status === 'FAILED' ? 'border-red-200 text-red-400 bg-red-50' : 'border-amber-200 text-amber-500 bg-amber-50'}`}>
                                                    {t.status}
                                                </span>
                                            )}
                                            <p className="text-[10px] font-bold text-brand-muted opacity-50 uppercase tracking-widest">
                                                {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(t.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {data.transactions.length === 0 && (
                                <p className="text-center py-20 text-brand-muted font-bold">No transactions yet.</p>
                            )}
                        </div>
                    </div>

                    <WithdrawalModal
                        isOpen={isWithdrawModalOpen}
                        onClose={() => setIsWithdrawModalOpen(false)}
                        balance={data.wallet?.balance || 0}
                        token={token}
                        onSuccess={refreshData}
                    />
                </main>
            </div>
        </div>
    );
}
