'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Loader2, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Lock, 
  X, 
  Building, 
  Target,
  CheckCircle2
} from 'lucide-react';

import CheckoutModal from '@/components/CheckoutModal';
import ProductCheckoutModal from '@/components/ProductCheckoutModal';
import MembershipCheckoutModal from '@/components/MembershipCheckoutModal';
import CommissionCheckoutModal from '@/components/CommissionCheckoutModal';
import { usePaystack } from '@/hooks/usePaystack';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function EmbedCheckoutContent() {
  const { username } = useParams();
  const searchParams = useSearchParams();
  
  const [creator, setCreator] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Read URL search params
  const mode = (searchParams.get('mode') || 'TIP').toUpperCase();
  const itemId = searchParams.get('itemId') || '';
  const amount = Number(searchParams.get('amount')) || (mode === 'TIP' ? 100 : 0);
  const message = searchParams.get('message') || '';
  const fanName = searchParams.get('name') || '';
  const source = searchParams.get('source') || 'Widget / SDK';

  // Campaign specific state
  const [buyerName, setBuyerName] = useState(fanName);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [donationAmount, setDonationAmount] = useState(amount > 0 ? amount.toString() : '1000');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const [checkingOut, setCheckingOut] = useState(false);
  const [campaignStep, setCampaignStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [campaignErrorMsg, setCampaignErrorMsg] = useState('');

  const { initializePayment } = usePaystack();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Creator details
        const creatorRes = await axios.get(`${BACKEND_URL}/api/creators/${username}`);
        setCreator(creatorRes.data);
        const creatorData = creatorRes.data;

        // 2. Fetch mode-specific checkout details
        if (mode === 'GOAL') {
          if (itemId) {
            const res = await axios.get(`${BACKEND_URL}/api/goals/public/id/${itemId}`);
            setItem(res.data);
          } else {
            const res = await axios.get(`${BACKEND_URL}/api/goals/active/${creatorData.id}`);
            setItem(res.data);
          }
        } else if (mode === 'PRODUCT') {
          if (itemId) {
            const res = await axios.get(`${BACKEND_URL}/api/products/public/id/${itemId}`);
            setItem(res.data);
          }
        } else if (mode === 'MEMBERSHIP') {
          if (itemId) {
            const res = await axios.get(`${BACKEND_URL}/api/memberships/public/tier/${itemId}`);
            setItem(res.data);
          }
        } else if (mode === 'COMMISSION') {
          if (itemId) {
            const res = await axios.get(`${BACKEND_URL}/api/commissions/services/public/id/${itemId}`);
            setItem(res.data);
          }
        } else if (mode === 'CAMPAIGN') {
          if (itemId) {
            const res = await axios.get(`${BACKEND_URL}/api/organizations/public/campaigns/${itemId}`);
            setItem(res.data);
          }
        }
      } catch (err) {
        console.error('Embed: Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username, mode, itemId]);

  const handleClose = () => {
    setIsModalOpen(false);
    window.parent.postMessage('close-chai-widget', '*');
    if ((window as any).TalentJar) {
      (window as any).TalentJar.postMessage('close-chai-widget');
    }
  };

  const handleSuccess = () => {
    window.parent.postMessage('payment-success', '*');
    if ((window as any).TalentJar) {
      (window as any).TalentJar.postMessage('payment-success');
    }
  };

  // Campaign checkout polling
  const startCampaignPolling = async (reference: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/payments/status/${reference}`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(interval);
          setCampaignStep('success');
          handleSuccess();
        } else if (res.data.status === 'FAILED') {
          clearInterval(interval);
          setCampaignStep('failed');
          setCampaignErrorMsg("Payment transaction failed or was canceled.");
        }
      } catch (err) {
        console.error('Status check failed');
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setCampaignStep((currentStep) => {
        if (currentStep === 'processing') {
          setCampaignErrorMsg("Payment request timed out. Please check your SMS or email for confirmation.");
          return 'failed';
        }
        return currentStep;
      });
    }, 120000);
  };

  const handleCampaignDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      addToast("Please enter your name.", 'error');
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      addToast("Please enter a valid email address.", 'error');
      return;
    }
    if (paymentMethod === 'MPESA' && (!buyerPhone || buyerPhone.length < 9)) {
      addToast("Please enter a valid M-Pesa phone number.", 'error');
      return;
    }

    const amountNum = Number(donationAmount);
    if (isNaN(amountNum) || amountNum <= 50) {
      addToast("Minimum donation amount is KES 50", 'error');
      return;
    }

    setCheckingOut(true);
    const nexoraFee = paymentMethod === 'MPESA' ? amountNum * 0.02 : amountNum * 0.05;
    const totalBill = amountNum + nexoraFee;

    try {
      const res = await axios.post(`${BACKEND_URL}/api/organizations/campaigns/${itemId}/checkout`, {
        paymentGateway: paymentMethod,
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone || undefined,
        amount: amountNum
      });

      if (paymentMethod === 'MPESA') {
        addToast(res.data.customerMessage || "Check your phone for the M-Pesa STK Prompt", 'info');
        setCampaignStep('processing');
        startCampaignPolling(res.data.checkoutRequestId);
      } else {
        const { reference, subaccount } = res.data;
        initializePayment({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: buyerEmail,
          amount: Math.round(totalBill * 100),
          currency: 'KES',
          reference,
          subaccount,
          onSuccess: (response: any) => {
            setCampaignStep('processing');
            startCampaignPolling(response?.reference || reference);
          },
          onClose: () => {
            setCheckingOut(false);
          }
        });
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || "Campaign checkout failed", 'error');
      setCheckingOut(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="animate-spin text-brand-primary" size={32} />
    </div>
  );

  if (!creator) return null;

  // Render modal based on mode
  if (mode === 'PRODUCT') {
    if (!item) return <div className="p-8 text-center font-bold text-red-500">Product not found.</div>;
    return (
      <div className="min-h-screen bg-transparent">
        <ProductCheckoutModal 
          isOpen={isModalOpen}
          onClose={handleClose}
          creator={creator}
          product={item}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  if (mode === 'MEMBERSHIP') {
    if (!item) return <div className="p-8 text-center font-bold text-red-500">Membership tier not found.</div>;
    return (
      <div className="min-h-screen bg-transparent">
        <MembershipCheckoutModal 
          isOpen={isModalOpen}
          onClose={handleClose}
          creator={creator}
          tier={item}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  if (mode === 'COMMISSION') {
    if (!item) return <div className="p-8 text-center font-bold text-red-500">Service not found.</div>;
    return (
      <div className="min-h-screen bg-transparent">
        <CommissionCheckoutModal 
          isOpen={isModalOpen}
          onClose={handleClose}
          creator={creator}
          service={item}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  if (mode === 'CAMPAIGN') {
    if (!item) return <div className="p-8 text-center font-bold text-red-500">Campaign not found.</div>;
    const primaryColorHex = creator.profile?.primaryColor || '#914D00';
    const amountVal = Number(donationAmount);
    const fee = paymentMethod === 'MPESA' ? amountVal * 0.02 : amountVal * 0.05;
    const total = amountVal + fee;

    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <AnimatePresence>
          {isModalOpen && (
            <>
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
                  {campaignStep === 'checkout' && (
                    <form onSubmit={handleCampaignDonate} className="space-y-6">
                      <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-1">
                        <div className="flex items-center gap-2" style={{ color: primaryColorHex }}>
                          <Target className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Support Fundraiser</span>
                        </div>
                        <button type="button" onClick={handleClose} className="p-2 hover:bg-black/5 rounded-full text-zinc-400 hover:text-black">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0 text-zinc-500">
                          <Building size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{item.title}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase">{item.organization?.name || 'Campaign'}</p>
                        </div>
                      </div>

                      <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 gap-1.5">
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

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Contribution Amount (KES)</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {['500', '1000', '2500', '5000'].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setDonationAmount(amt)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                donationAmount === amt 
                                  ? 'bg-[#914D00]/5 border-[#914D00] text-[#914D00]' 
                                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                              }`}
                              style={donationAmount === amt ? { color: primaryColorHex, borderColor: primaryColorHex, backgroundColor: `${primaryColorHex}10` } : {}}
                            >
                              KES {amt}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          required
                          min="50"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          placeholder="Custom Amount"
                          className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Your Name</label>
                          <input
                            type="text"
                            required
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="Jane Doe"
                            className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
                          <input
                            type="email"
                            required
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            placeholder="jane@example.com"
                            className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                          />
                        </div>

                        {paymentMethod === 'MPESA' && (
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">M-Pesa Mobile Number</label>
                            <input
                              type="tel"
                              required
                              value={buyerPhone}
                              onChange={(e) => setBuyerPhone(e.target.value)}
                              placeholder="e.g. 0712345678"
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-zinc-500">
                          <span>Donation</span>
                          <span>KES {amountVal.toLocaleString()}.00</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-zinc-500">
                          <span>Platform Fee</span>
                          <span>KES {fee.toLocaleString()}.00</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-zinc-200 pt-2">
                          <span>Total Bill</span>
                          <span style={{ color: primaryColorHex }}>KES {total.toLocaleString()}.00</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={checkingOut}
                        className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/10"
                        style={{ backgroundColor: primaryColorHex }}
                      >
                        {checkingOut ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Fulfilling Checkout...
                          </>
                        ) : (
                          `Support Fundraiser`
                        )}
                      </button>
                    </form>
                  )}

                  {campaignStep === 'processing' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <Loader2 size={40} className="animate-spin mb-6" style={{ color: primaryColorHex }} />
                      <h3 className="text-lg font-bold mb-2">Processing Payment...</h3>
                      <p className="text-xs font-medium text-zinc-500 leading-relaxed px-4">
                        {paymentMethod === 'MPESA'
                          ? "We have sent an STK prompt to your phone. Enter your M-Pesa PIN to complete payment."
                          : "Verifying your donation details..."}
                      </p>
                    </div>
                  )}

                  {campaignStep === 'success' && (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <Heart size={48} className="text-red-500 fill-current mb-6 animate-bounce" />
                      <h3 className="text-lg font-bold mb-2">Thank You</h3>
                      <p className="text-xs font-semibold text-zinc-500 leading-relaxed mb-6 px-4">
                        Your contribution of KES {amountVal.toLocaleString()} has been received successfully. Thank you for supporting our mission.
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-6 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Close Checkout
                      </button>
                    </div>
                  )}

                  {campaignStep === 'failed' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                        <X size={24} />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Payment Failed</h3>
                      <p className="text-xs font-medium text-zinc-500 leading-relaxed mb-6 px-4">{campaignErrorMsg}</p>
                      <button
                        onClick={() => setCampaignStep('checkout')}
                        className="px-6 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default to TIP or GOAL (since CheckoutModal handles both TIP and GOAL)
  return (
    <div className="min-h-screen bg-transparent">
      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        creator={creator}
        amount={amount}
        message={message}
        fanName={fanName}
        source={source}
        goalId={mode === 'GOAL' ? item?.id : undefined}
        paymentType={mode === 'GOAL' ? 'GOAL' : 'TIP'}
      />
    </div>
  );
}

export default function EmbedCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    }>
      <EmbedCheckoutContent />
    </Suspense>
  );
}
