'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader2, Heart, CheckCircle2, Sparkles, FileText } from 'lucide-react';
import axios from 'axios';
import { usePaystack } from '@/hooks/usePaystack';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface CommissionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    displayName: string;
    username: string;
  };
  service: {
    id: string;
    title: string;
    price: number;
    currency: string;
    deliveryDays: number;
    requirementsSchema?: string | null;
  };
  primaryColorHex?: string;
  onSuccess?: (reference: string) => void;
}

export default function CommissionCheckoutModal({
  isOpen,
  onClose,
  creator,
  service,
  primaryColorHex = '#914D00',
  onSuccess
}: CommissionCheckoutModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  
  // Custom requirements state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);

  const { initializePayment } = usePaystack();
  const addToast = useToastStore((state) => state.addToast);

  const amount = Number(service.price);
  const mpesaFee = amount * 0.02;
  const cardFee = amount * 0.05;
  const mpesaTotal = amount + mpesaFee;
  const cardTotal = amount + cardFee;

  // Parse questions from schema
  useEffect(() => {
    if (service.requirementsSchema) {
      try {
        const parsed = JSON.parse(service.requirementsSchema);
        if (Array.isArray(parsed)) {
          setParsedQuestions(parsed);
          const initialAnswers: Record<string, string> = {};
          parsed.forEach((q, idx) => {
            initialAnswers[q.label || `Question ${idx + 1}`] = '';
          });
          setAnswers(initialAnswers);
        } else {
          setParsedQuestions([]);
        }
      } catch (e) {
        setParsedQuestions([]);
      }
    } else {
      setParsedQuestions([]);
    }
  }, [service]);

  const startPolling = async (reference: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/payments/status/${reference}`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(interval);
          setStep('success');
          if (onSuccess) onSuccess(reference);
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

    // Verify requirements are filled out
    if (parsedQuestions.length > 0) {
      const emptyQuestion = parsedQuestions.find(q => q.required && !answers[q.label]?.trim());
      if (emptyQuestion) {
        addToast(`Please answer the question: "${emptyQuestion.label}"`, 'error');
        return;
      }
    } else {
      if (!answers['Generic Instructions']?.trim()) {
        addToast("Please provide details/instructions for your request.", 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/commissions/checkout`, {
        serviceId: service.id,
        paymentGateway: paymentMethod,
        buyerName,
        buyerEmail: email,
        buyerPhone: phoneNumber || undefined,
        requirements: JSON.stringify(answers)
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
      addToast(err.response?.data?.error || "Commission checkout failed", 'error');
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Hire Creator</span>
                  </div>
                  <button onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full text-zinc-400 hover:text-black">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0" style={{ color: primaryColorHex, backgroundColor: `${primaryColorHex}15` }}>
                    <Sparkles size={18} className="fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{service.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Delivered within {service.deliveryDays} day{service.deliveryDays !== 1 && 's'}</p>
                  </div>
                </div>

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
                      placeholder="buyer@example.com"
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

                  {/* Dynamic Requirements Questionnaire */}
                  <div className="border-t border-black/5 pt-4 mt-4 space-y-4">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
                      <FileText size={12} /> Project Instructions
                    </h5>
                    {parsedQuestions.length > 0 ? (
                      parsedQuestions.map((q, idx) => (
                        <div key={idx}>
                          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                            {q.label} {q.required && <span className="text-red-500">*</span>}
                          </label>
                          {q.type === 'textarea' ? (
                            <textarea
                              value={answers[q.label] || ''}
                              onChange={(e) => setAnswers({ ...answers, [q.label]: e.target.value })}
                              placeholder={q.placeholder || "Enter details..."}
                              rows={3}
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={answers[q.label] || ''}
                              onChange={(e) => setAnswers({ ...answers, [q.label]: e.target.value })}
                              placeholder={q.placeholder || "Enter answer..."}
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                          Describe your request / instructions <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={answers['Generic Instructions'] || ''}
                          onChange={(e) => setAnswers({ 'Generic Instructions': e.target.value })}
                          placeholder="Provide details about what you want the creator to do..."
                          rows={4}
                          className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Service Price</span>
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
                      <Loader2 size={16} className="animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    `Pay KES ${(paymentMethod === 'MPESA' ? mpesaTotal : cardTotal).toLocaleString()}`
                  )}
                </button>
              </>
            )}

            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 size={40} className="animate-spin mb-6" style={{ color: primaryColorHex }} />
                <h3 className="text-lg font-bold mb-2">Processing Payment...</h3>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed px-4">
                  {paymentMethod === 'MPESA'
                    ? "We have sent an STK prompt to your phone. Enter your M-Pesa PIN to complete payment."
                    : "Verifying your order details..."}
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={48} className="text-green-500 mb-6" />
                <h3 className="text-lg font-bold mb-2">Order Confirmed! 🎉</h3>
                <p className="text-xs font-semibold text-zinc-500 leading-relaxed mb-6 px-4">
                  Awesome! Your commission order has been received by {creator.displayName}. You will receive status updates and deliverables in your inbox.
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
                <h3 className="text-lg font-bold mb-2">Payment Failed</h3>
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
