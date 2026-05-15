'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRight, ShieldCheck, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    token: string | null;
    onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, balance, token, onSuccess }: WithdrawalModalProps) {
    const [loading, setLoading] = useState(false);
    const addToast = useToastStore((state) => state.addToast);

    const getNetworkFee = (amt: number) => {
        if (amt <= 100) return 0;
        if (amt <= 1500) return 5;
        if (amt <= 5000) return 9;
        if (amt <= 20000) return 11;
        return 13;
    };
    
    const networkFee = getNetworkFee(balance);
    const netAmount = balance - networkFee;

    const handleConfirm = async () => {
        if (balance < 100) {
            addToast("Minimum withdrawal is KES 100", "error");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/api/withdrawals/mpesa`, {
                grossAmount: balance
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            addToast("Withdrawal initiated! Funds will arrive in your M-Pesa shortly.", "success");
            onSuccess();
            onClose();
        } catch (err: any) {
            addToast(err.response?.data?.error || "Withdrawal failed. Please check your settings.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-black/5 overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 text-brand-primary">
                                <Wallet size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Withdraw Funds</span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-brand-muted hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-center mb-10">
                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Available to Withdraw</p>
                            <h2 className="text-4xl font-bold tracking-tight">KES {balance.toLocaleString()}.00</h2>
                        </div>

                        <div className="bg-brand-beige-light rounded-3xl p-6 space-y-4 mb-8 border border-black/[0.03]">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-brand-muted">Withdrawal Amount</span>
                                <span className="font-bold">KES {balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1.5 font-bold text-brand-muted">
                                    Network Fee <Info size={12} className="opacity-50" />
                                </div>
                                <span className="font-bold text-red-500">- KES {networkFee}</span>
                            </div>
                            <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                                <span className="font-bold uppercase tracking-widest text-[10px] text-brand-muted">Total to Receive</span>
                                <span className="text-xl font-bold text-[#00A65A]">KES {netAmount.toLocaleString()}.00</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={handleConfirm}
                                disabled={loading || balance < 100}
                                className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-primary transition-all disabled:opacity-50 shadow-xl shadow-black/10"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                Confirm Withdrawal
                            </button>
                            
                            <p className="text-[8px] text-center font-bold text-brand-muted uppercase tracking-widest px-4 leading-relaxed">
                                By confirming, you agree to the automated M-Pesa B2C transfer to your registered number.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
