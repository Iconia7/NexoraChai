'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, CheckCircle2, Loader2, ShoppingBag, Download } from 'lucide-react';
import axios from 'axios';
import { usePaystack } from '@/hooks/usePaystack';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface ProductCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    creator: {
        id: string;
        displayName: string;
        username: string;
    };
    product: {
        id: string;
        title: string;
        price: number;
        currency: string;
        isFree: boolean;
    };
    primaryColorHex?: string;
    onSuccess?: () => void;
}

export default function ProductCheckoutModal({ isOpen, onClose, creator, product, primaryColorHex = '#914D00', onSuccess }: ProductCheckoutModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
    const [errorMsg, setErrorMsg] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
    const [freeDownloadLinks, setFreeDownloadLinks] = useState<{ fileName: string; url: string }[]>([]);
    const { initializePayment } = usePaystack();
    const addToast = useToastStore((state) => state.addToast);

    // Fees calculation
    const amount = Number(product.price);
    const mpesaFee = amount * 0.02;
    const cardFee = amount * 0.05;
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
                } else if (res.data.status === 'FAILED') {
                    clearInterval(interval);
                    setStep('failed');
                    setErrorMsg("Payment transaction failed or was canceled.");
                }
            } catch (err) {
                console.error('Status check failed');
            }
        }, 3000);

        // Timeout after 2 minutes
        setTimeout(() => {
            clearInterval(interval);
            setStep((currentStep) => {
                if (currentStep === 'processing') {
                    setErrorMsg("Payment request timed out. Please check your email for download link confirmation.");
                    return 'failed';
                }
                return currentStep;
            });
        }, 120000);
    };

    const validateEmail = (e: string) => {
        return String(e)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleCheckout = async () => {
        if (!product.isFree) {
            if (paymentMethod === 'CARD' && !validateEmail(email)) {
                addToast("Please enter a valid email address.", 'error');
                return;
            }
            if (paymentMethod === 'MPESA') {
                if (!phoneNumber || phoneNumber.length < 9) {
                    addToast("Please enter a valid M-Pesa phone number.", 'error');
                    return;
                }
                if (email && !validateEmail(email)) {
                    addToast("Please enter a valid email address.", 'error');
                    return;
                }
            }
        } else {
            // Free product requires email or phone
            if (!email && !phoneNumber) {
                addToast("Please enter either email or phone to receive download links.", 'error');
                return;
            }
            if (email && !validateEmail(email)) {
                addToast("Please enter a valid email address.", 'error');
                return;
            }
        }

        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/products/checkout`, {
                productId: product.id,
                paymentGateway: paymentMethod,
                buyerName: buyerName || 'A Supporter',
                buyerEmail: email || undefined,
                buyerPhone: phoneNumber || undefined
            });

            if (product.isFree) {
                // Free Checkout is completed instantly
                setFreeDownloadLinks(res.data.downloadLinks || []);
                setStep('success');
                if (onSuccess) onSuccess();
                return;
            }

            if (paymentMethod === 'MPESA') {
                addToast(res.data.customerMessage || "Check your phone for the M-Pesa STK Prompt", 'info');
                setStep('processing');
                startPolling(res.data.checkoutRequestId);
            } else {
                // Paystack Credit Card
                const { reference, subaccount } = res.data;
                initializePayment({
                    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
                    email: email,
                    amount: Math.round(cardTotal * 100),
                    currency: 'KES',
                    reference,
                    subaccount,
                    onSuccess: (response: any) => {
                        setStep('processing');
                        startPolling(response?.reference || reference);
                    },
                    onClose: () => {
                        setLoading(false);
                    }
                });
            }
        } catch (err: any) {
            addToast(err.response?.data?.error || "Checkout failed", 'error');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('checkout');
        setLoading(false);
        setErrorMsg('');
        setFreeDownloadLinks([]);
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
                    className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-black/5 flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden"
                >
                    <div className="overflow-y-auto p-6 md:p-8 no-scrollbar">
                        {step === 'checkout' && (
                            <>
                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-1">
                                    <div className="flex items-center gap-2 text-brand-primary" style={{ color: primaryColorHex }}>
                                        <Lock className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Digital Shop Checkout</span>
                                    </div>
                                    <button onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full text-brand-muted hover:text-black">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="p-4 bg-brand-beige-light/40 rounded-2xl border border-black/[0.02] flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0" style={{ color: primaryColorHex, backgroundColor: `${primaryColorHex}15` }}>
                                        <ShoppingBag size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm truncate">{product.title}</h4>
                                        <p className="text-[10px] font-bold text-brand-muted uppercase">By {creator.displayName}</p>
                                    </div>
                                </div>

                                {!product.isFree && (
                                    <div className="flex bg-brand-beige-light/50 p-1.5 rounded-2xl border border-black/[0.02] gap-1.5 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('MPESA')}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${paymentMethod === 'MPESA' ? 'bg-[#00E676] text-black shadow-sm' : 'text-brand-muted hover:text-black'}`}
                                        >
                                            M-Pesa STK
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('CARD')}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${paymentMethod === 'CARD' ? 'bg-[#914D00] text-white shadow-sm' : 'text-brand-muted hover:text-black'}`}
                                            style={paymentMethod === 'CARD' ? { backgroundColor: primaryColorHex } : {}}
                                        >
                                            Card / Visa
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Your Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={buyerName}
                                            onChange={(e) => setBuyerName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                        />
                                    </div>

                                    {(product.isFree || paymentMethod === 'CARD' || paymentMethod === 'MPESA') && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Email Address {product.isFree ? '(Optional)' : '(Required)'}</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                            />
                                        </div>
                                    )}

                                    {(product.isFree || paymentMethod === 'MPESA') && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">M-Pesa Mobile Number {product.isFree ? '(Optional)' : '(Required)'}</label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="e.g. 0712345678"
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                            />
                                        </div>
                                    )}
                                </div>

                                {!product.isFree && (
                                    <div className="p-4 bg-brand-beige-light/30 rounded-2xl border border-black/[0.01] space-y-2 mb-6">
                                        <div className="flex justify-between text-xs font-semibold text-brand-muted">
                                            <span>Subtotal</span>
                                            <span>KES {amount.toLocaleString()}.00</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-semibold text-brand-muted">
                                            <span>Gateway Network Fee</span>
                                            <span>KES {(paymentMethod === 'MPESA' ? mpesaFee : cardFee).toLocaleString()}.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold border-t border-black/5 pt-2">
                                            <span>Total Amount</span>
                                            <span style={{ color: primaryColorHex }}>KES {(paymentMethod === 'MPESA' ? mpesaTotal : cardTotal).toLocaleString()}.00</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    style={{ backgroundColor: primaryColorHex }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Initializing...
                                        </>
                                    ) : (
                                        product.isFree ? 'Get Free Downloads' : `Pay KES ${(paymentMethod === 'MPESA' ? mpesaTotal : cardTotal).toLocaleString()}`
                                    )}
                                </button>
                            </>
                        )}

                        {step === 'processing' && (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <Loader2 size={40} className="text-brand-primary animate-spin mb-6" style={{ color: primaryColorHex }} />
                                <h3 className="text-lg font-bold mb-2">Processing Payment...</h3>
                                <p className="text-xs font-medium text-brand-muted leading-relaxed px-4">
                                    {paymentMethod === 'MPESA'
                                        ? "We have sent an STK prompt to your phone. Enter your M-Pesa PIN to complete the transaction."
                                        : "Verifying your card payment details..."}
                                </p>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="py-8 flex flex-col items-center justify-center text-center">
                                <CheckCircle2 size={48} className="text-green-500 mb-6" />
                                <h3 className="text-lg font-bold mb-2">Order Confirmed!</h3>
                                <p className="text-xs font-semibold text-brand-muted leading-relaxed mb-6 px-4">
                                    {product.isFree
                                        ? "Here are your download links. We have also sent them to your email."
                                        : "Thank you for your purchase! We have sent secure download links to your email."}
                                </p>

                                {freeDownloadLinks.length > 0 && (
                                    <div className="w-full space-y-2 mb-6 text-left">
                                        {freeDownloadLinks.map((link, idx) => (
                                            <a
                                                key={idx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full border border-black/10 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                                            >
                                                <span className="truncate pr-4">{link.fileName}</span>
                                                <Download size={14} className="shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={handleClose}
                                    className="px-6 py-3 border border-black/10 hover:bg-black/[0.02] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}

                        {step === 'failed' && (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                                    <X size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Checkout Failed</h3>
                                <p className="text-xs font-medium text-brand-muted leading-relaxed mb-6 px-4">{errorMsg}</p>
                                <button
                                    onClick={() => setStep('checkout')}
                                    className="px-6 py-3 border border-black/10 hover:bg-black/[0.02] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
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
