'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader2, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { usePaystack } from '@/hooks/usePaystack';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface MembershipCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    displayName: string;
    username: string;
  };
  tier: {
    id: string;
    name: string;
    price: number;
    currency: string;
    billingInterval: string;
  };
  primaryColorHex?: string;
  onSuccess?: () => void;
}

export default function MembershipCheckoutModal({
  isOpen,
  onClose,
  creator,
  tier,
  primaryColorHex = '#914D00',
  onSuccess
}: MembershipCheckoutModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const { initializePayment } = usePaystack();
  const addToast = useToastStore((state) => state.addToast);

  // Fee calculation (matches backend: 2% for Mpesa, 5% for Card)
  const amount = Number(tier.price);
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
          setErrorMsg("Payment request timed out. Please check your SMS or email for confirmation.");
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
    if (!buyerName.trim()) {
      addToast("Please enter your name.", 'error');
      return;
    }
    if (!validateEmail(email)) {
      addToast("Please enter a valid email address.", 'error');
      return;
    }
    if (paymentMethod === 'MPESA' && (!phoneNumber || phoneNumber.length < 9)) {
      addToast("Please enter a valid M-Pesa phone number.", 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/memberships/checkout`, {
        tierId: tier.id,
        paymentGateway: paymentMethod,
        buyerName,
        buyerEmail: email,
        buyerPhone: phoneNumber || undefined
      });

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
      addToast(err.response?.data?.error || "Subscription checkout failed", 'error');
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
          className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-black/5 flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden text-gray-900"
        >
          <div className="overflow-y-auto p-6 md:p-8 no-scrollbar">
            {step === 'checkout' && (
              <>
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-1">
                  <div className="flex items-center gap-2" style={{ color: primaryColorHex }}>
                    <Lock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Join Creator Membership</span>
                  </div>
                  <button onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full text-zinc-400 hover:text-black">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0" style={{ color: primaryColorHex, backgroundColor: `${primaryColorHex}15` }}>
                    <Heart size={18} className="fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{tier.name}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Per {tier.billingInterval.toLowerCase()}</p>
                  </div>
                </div>

                {/* Manual M-Pesa renewal heads-up alert */}
                {paymentMethod === 'MPESA' && (
                  <div className="mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-2.5 text-xs text-zinc-600 font-medium">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-900">M-Pesa Note:</span> Subscriptions are manual. You will receive an SMS reminder via Africa's Talking 3 days before renewal.
                    </div>
                  </div>
                )}

                <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 gap-1.5 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MPESA')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${paymentMethod === 'MPESA' ? 'bg-[#00E676] text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                  >
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${paymentMethod === 'CARD' ? 'bg-[#914D00] text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                    style={paymentMethod === 'CARD' ? { backgroundColor: primaryColorHex } : {}}
                  >
                    Card / Visa
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="subscriber@example.com"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {paymentMethod === 'MPESA' && (
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">M-Pesa Mobile Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Membership Price</span>
                    <span>KES {amount.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Platform Gateway Fee</span>
                    <span>KES {(paymentMethod === 'MPESA' ? mpesaFee : cardFee).toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-zinc-200 pt-2">
                    <span>Total Bill</span>
                    <span style={{ color: primaryColorHex }}>KES {(paymentMethod === 'MPESA' ? mpesaTotal : cardTotal).toLocaleString()}.00</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColorHex }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Subscribing...
                    </>
                  ) : (
                    `Subscribe for KES ${(paymentMethod === 'MPESA' ? mpesaTotal : cardTotal).toLocaleString()}`
                  )}
                </button>
              </>
            )}

            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 size={40} className="animate-spin mb-6" style={{ color: primaryColorHex }} />
                <h3 className="text-lg font-bold mb-2">Processing Subscription...</h3>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed px-4">
                  {paymentMethod === 'MPESA'
                    ? "We have sent an STK prompt to your phone. Enter your M-Pesa PIN to complete subscription."
                    : "Verifying your membership details..."}
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={48} className="text-green-500 mb-6" />
                <h3 className="text-lg font-bold mb-2">Welcome Subscriber! 🎉</h3>
                <p className="text-xs font-semibold text-zinc-500 leading-relaxed mb-6 px-4">
                  Awesome! Your payment has been confirmed. You are now officially subscribed to {creator.displayName}'s {tier.name} membership!
                </p>

                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {step === 'failed' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                  <X size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Checkout Failed</h3>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed mb-6 px-4">{errorMsg}</p>
                <button
                  onClick={() => setStep('checkout')}
                  className="px-6 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
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
