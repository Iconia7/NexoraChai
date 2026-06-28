'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function DownloadPage() {
    const { token } = useParams();
    const [counter, setCounter] = useState(3);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            setCounter((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    triggerDownload();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [token]);

    const triggerDownload = () => {
        setDownloading(true);
        if (typeof window !== 'undefined') {
            window.location.href = `${BACKEND_URL}/api/products/download/${token}`;
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans flex flex-col justify-between selection:bg-brand-primary/10 animate-fade-in">
            <PublicNavbar />

            <main className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 card-shadow border border-black/[0.02] text-center"
                >
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <ShieldCheck size={40} />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight mb-3">Your Download is Ready</h1>
                    <p className="text-sm font-medium text-brand-muted leading-relaxed mb-8">
                        Secure download link verified. Your file download will start automatically in{' '}
                        <span className="font-extrabold text-brand-secondary">{counter}s</span>...
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={triggerDownload}
                            className="w-full py-4 bg-[#914D00] hover:bg-[#7D4200] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/10"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Starting Download...
                                </>
                            ) : (
                                <>
                                    <Download size={16} /> Download File Now
                                </>
                            )}
                        </button>

                        <Link
                            href="/"
                            className="w-full py-4 border border-black/10 hover:bg-black/[0.02] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to home
                        </Link>
                    </div>

                    <div className="mt-8 text-[10px] font-bold text-brand-muted uppercase tracking-widest opacity-60">
                        Securely processed by Talent Jar
                    </div>
                </motion.div>
            </main>

            <PublicFooter />
        </div>
    );
}
