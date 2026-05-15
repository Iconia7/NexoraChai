'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, CheckCircle2, Loader2, Zap, Mail } from 'lucide-react';
import axios from 'axios';
import { usePaystack } from '@/hooks/usePaystack';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    creator: {
        id: string;
        displayName: string;
        username: string;
    };
    amount: number;
    message: string;
    fanName?: string;
    onSuccess?: () => void;
}

export default function CheckoutModal({ isOpen, onClose, creator, amount, message, fanName, onSuccess }: CheckoutModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
    const [errorMsg, setErrorMsg] = useState('');
    const { initializePayment } = usePaystack();
    const addToast = useToastStore((state) => state.addToast);

    // Dynamic fees
    const mpesaFee = amount * 0.02;
    const cardFee = amount * 0.05;
    
    // For the UI summary, we'll show both to be transparent
    const mpesaTotal = amount + mpesaFee;
    const cardTotal = amount + cardFee;

    const startPolling = async (reference: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/payments/status/${reference}`);
                if (res.data.status === 'COMPLETED') {
                    clearInterval(interval);
                    setStep('success');
                    if (onSuccess) onSuccess();
                    setTimeout(() => handleClose(), 5000);
                } else if (res.data.status === 'FAILED') {
                    clearInterval(interval);
                    setStep('failed');
                    setErrorMsg("Transaction failed or was canceled.");
                    setTimeout(() => handleClose(), 5000);
                }
            } catch (err) {
                console.error('Status check failed');
            }
        }, 3000);

        // Timeout after 2 minutes
        setTimeout(() => {
            clearInterval(interval);
            if (step === 'processing') {
                setStep('failed');
                setErrorMsg("Request timed out. Please check your transaction history.");
            }
        }, 120000);
    };

    const validateEmail = (e: string) => {
        return String(e)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
    };

    const handleMpesaPay = async () => {
        if (!validateEmail(email)) {
            addToast("Please enter a valid email address for your receipt", 'error');
            return;
        }
        if (!phoneNumber || phoneNumber.length < 9) {
            addToast("Please enter a valid M-Pesa phone number", 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/payments/initialize-mpesa`, {
                creatorId: creator.id,
                amount,
                phoneNumber,
                email,
                fanName: fanName || 'A Supporter',
                fanMessage: message
            });

            addToast(res.data.customerMessage || "Check your phone for the M-Pesa prompt", 'info');
            setStep('processing');
            startPolling(res.data.checkoutRequestId);
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to initiate M-Pesa payment", 'error');
            setLoading(false);
        }
    };

    const handleCardPay = async () => {
        if (!validateEmail(email)) {
            addToast("Please enter a valid email address", 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/payments/initialize`, {
                creatorId: creator.id,
                amount,
                email,
                fanName: fanName || 'A Supporter',
                fanMessage: message
            });

            const { reference, access_code, subaccount } = res.data;

            initializePayment({
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
                email: email,
                amount: Math.round(cardTotal * 100),
                currency: 'KES',
                reference,
                accessCode: access_code,
                subaccount,
                onSuccess: (response: any) => {
                    setStep('processing');
                    startPolling(reference);
                },
                onClose: () => {
                    setLoading(false);
                }
            });
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to initialize card payment", 'error');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('checkout');
        setLoading(false);
        setErrorMsg('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                />
                
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-sm bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-black/5 flex flex-col max-h-[95vh] md:max-h-[90vh]"
                >
                    <div className="overflow-y-auto p-6 md:p-8 no-scrollbar">
                        {step === 'checkout' ? (
                            <>
                                <div className="flex items-center justify-between mb-6 md:mb-8 sticky top-0 bg-white z-10 py-2">
                                    <div className="flex items-center gap-2 text-brand-primary">
                                        <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                                    </div>
                                    <button 
                                        onClick={handleClose}
                                        className="text-brand-muted hover:text-black transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Summary */}
                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-sm font-bold text-brand-muted">
                                        <span>Support Amount</span>
                                        <span>KES {amount.toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="p-4 bg-black/[0.02] rounded-2xl space-y-2 border border-black/[0.03]">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-muted/60">
                                            <span>M-Pesa Fee (2%)</span>
                                            <span>+ KES {mpesaFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-primary/60">
                                            <span>Card Fee (5%)</span>
                                            <span>+ KES {cardFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-black/[0.03] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <span className="font-bold uppercase tracking-widest text-[10px] text-brand-muted">Final Total</span>
                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                            <div className="text-xs font-bold text-[#00A65A]">M-Pesa: KES {mpesaTotal.toLocaleString()}</div>
                                            <div className="text-base md:text-lg font-bold text-brand-primary">Card: KES {cardTotal.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Email Input */}
                                <div className="mb-6">
                                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">Receipt Email</label>
                                    <div className="flex items-center bg-[#F9FAFB] border border-black/5 rounded-2xl overflow-hidden px-4">
                                        <Mail size={16} className="text-brand-muted" />
                                        <input 
                                            type="email"
                                            placeholder="fan@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex-1 bg-transparent py-4 px-3 focus:outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                {/* M-Pesa Number Confirmation */}
                                <div className="mb-8">
                                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">M-Pesa Number</label>
                                    <div className="flex items-center bg-[#F9FAFB] border border-black/5 rounded-2xl overflow-hidden">
                                        <div className="pl-4 pr-2 flex items-center gap-2 border-r border-black/5">
                                            <span className="text-xl">🇰🇪</span>
                                            <span className="text-sm font-bold">+254</span>
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder="712 345 678"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="flex-1 bg-transparent py-4 px-4 focus:outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button 
                                        onClick={handleMpesaPay}
                                        disabled={loading}
                                        className="w-full bg-[#00A65A] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#008F4D] transition-colors shadow-lg shadow-[#00A65A]/20 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
                                        Support with M-Pesa
                                    </button>

                                    <div className="relative py-4 text-center">
                                        <span className="bg-white px-4 text-[8px] font-bold text-brand-muted uppercase tracking-[0.2em] relative z-10">Or</span>
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/5" />
                                    </div>

                                    <button 
                                        onClick={handleCardPay}
                                        disabled={loading}
                                        className="w-full border border-black/10 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
                                    >
                                        <CreditCard size={18} />
                                        Buy with Card
                                    </button>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-2 text-[8px] font-bold text-brand-muted uppercase tracking-widest opacity-40">
                                   <Shield size={10} /> Secured by Nexora Trust
                                </div>
                            </>
                        ) : step === 'processing' ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                    <div className="absolute inset-0 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                                    <Zap size={32} className="text-brand-primary animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-bold mb-4 tracking-tight">Processing...</h2>
                                <p className="text-brand-muted font-medium text-sm leading-relaxed px-4">
                                    Please follow the prompt on your phone or check your card window. We're waiting for confirmation.
                                </p>
                            </div>
                        ) : step === 'success' ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-[#00E676]/10 text-[#00E676] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-4 tracking-tight text-[#00A65A]">Support Successful!</h2>
                                <p className="text-brand-muted font-medium text-sm mb-10 leading-relaxed px-4">
                                    Thank you! Your support has been verified and added to the creator's wallet.
                                </p>
                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest opacity-40">
                                    Closing automatically in 5s...
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <X size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-4 tracking-tight text-red-600">Payment Failed</h2>
                                <p className="text-brand-muted font-medium text-sm mb-10 leading-relaxed px-4">
                                    {errorMsg || "Something went wrong with your transaction. Please try again."}
                                </p>
                                <button 
                                    onClick={() => setStep('checkout')}
                                    className="w-full btn-primary py-4 text-sm font-bold bg-black text-white rounded-2xl"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Shield({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
