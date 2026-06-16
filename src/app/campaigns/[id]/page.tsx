'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Loader2,
  Calendar,
  ArrowLeft,
  Shield,
  Heart,
  CheckCircle2,
  Globe,
  Building,
  Target,
  X
} from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePaystack } from '@/hooks/usePaystack';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function CampaignDonationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const addToast = useToastStore((state) => state.addToast);
  const { initializePayment } = usePaystack();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout Form fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [donationAmount, setDonationAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  
  // Checkout Status States
  const [checkingOut, setCheckingOut] = useState(false);
  const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCampaignDetails = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/organizations/public/campaigns/${id}`);
      setCampaign(res.data);
    } catch (err: any) {
      console.error('Failed to load campaign details', err);
      addToast(err.response?.data?.error || 'Campaign not found or inactive.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
    }
  }, [id]);

  const startPolling = async (reference: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/payments/status/${reference}`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(interval);
          setStep('success');
          fetchCampaignDetails(); // Refresh raised totals
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

  const handleDonate = async (e: React.FormEvent) => {
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
      const res = await axios.post(`${BACKEND_URL}/api/organizations/campaigns/${id}/checkout`, {
        paymentGateway: paymentMethod,
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone || undefined,
        amount: amountNum
      });

      if (paymentMethod === 'MPESA') {
        addToast(res.data.customerMessage || "Check your phone for the M-Pesa STK Prompt", 'info');
        setStep('processing');
        startPolling(res.data.checkoutRequestId);
      } else {
        // Paystack Card Payment
        const { reference, subaccount } = res.data;
        initializePayment({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: buyerEmail,
          amount: Math.round(totalBill * 100),
          currency: 'KES',
          reference,
          subaccount,
          onSuccess: (response: any) => {
            setStep('processing');
            startPolling(response?.reference || reference);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-foreground font-sans animate-pulse">
        <PublicNavbar />
        <div className="max-w-2xl mx-auto px-6 py-20 space-y-8">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-3/4 bg-gray-300 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-48 w-full bg-gray-200 rounded-3xl" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige-light px-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Campaign lookup failed</h1>
        <p className="text-brand-muted font-medium mb-8">This campaign details are not available or has been paused.</p>
        <Link href="/" className="btn-primary px-8 py-4 bg-[#914D00] text-sm uppercase tracking-widest font-bold text-white rounded-xl">Go Home</Link>
      </div>
    );
  }

  const targetAmount = Number(campaign.targetAmount);
  const currentAmount = Number(campaign.currentAmount);
  const progressPct = Math.min(100, Math.round((currentAmount / targetAmount) * 100)) || 0;
  const ownerProfile = campaign.organization?.owner?.profile;
  const logoUrl = campaign.organization?.logoUrl;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="flex justify-between items-center mb-8">
          {ownerProfile && (
            <Link 
              href={`/${ownerProfile.username}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:opacity-85 text-[#914D00]"
            >
              <ArrowLeft size={16} /> Visit Creator Page
            </Link>
          )}
          <span className="text-[10px] font-mono font-bold text-zinc-400">CAMPAIGN HUB</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Campaign details */}
          <div className="md:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-black/[0.02] shadow-xl p-6 md:p-10 space-y-6">
              <div className="flex items-center gap-4 border-b border-black/[0.05] pb-6">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-black/5 shrink-0 bg-zinc-100 flex items-center justify-center text-zinc-400">
                  {logoUrl ? (
                    <img 
                      src={logoUrl}
                      alt={campaign.organization.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building size={24} />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-[10px] leading-tight text-zinc-400 uppercase tracking-widest">Organization Cause</p>
                  <p className="font-bold text-lg text-zinc-950 mt-0.5">{campaign.organization.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-extrabold text-2xl tracking-tight text-zinc-950 leading-tight">{campaign.title}</h2>
                <p className="text-xs text-zinc-500 leading-relaxed font-semibold whitespace-pre-line">{campaign.description || 'No description provided.'}</p>
              </div>

              {/* Progress metrics uis */}
              <div className="p-6 bg-zinc-50 rounded-3xl border border-black/[0.02] space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span>Funds Raised</span>
                  <span className="text-zinc-800">{progressPct}% Complete</span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-2xl font-extrabold text-green-600">KES {currentAmount.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Target: KES {targetAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Checkout Card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-black/[0.02] shadow-xl p-6 md:p-8 space-y-6">
              {step === 'checkout' && (
                <form onSubmit={handleDonate} className="space-y-6">
                  <div className="flex items-center gap-2 text-[#914D00]">
                    <Target className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Support Fundraiser</span>
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
                    >
                      Card / Visa
                    </button>
                  </div>

                  {/* Predefined amounts selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Select Contribution Amount</label>
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

                  <button
                    type="submit"
                    disabled={checkingOut}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl bg-[#914D00] hover:bg-[#7D4200] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/10"
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

              {step === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 size={40} className="animate-spin text-[#914D00] mb-6" />
                  <h3 className="text-lg font-bold mb-2">Processing Payment...</h3>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed px-4">
                    {paymentMethod === 'MPESA'
                      ? "We have sent an STK prompt to your phone. Enter your M-Pesa PIN to complete payment."
                      : "Verifying your donation details..."}
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <Heart size={48} className="text-red-500 fill-current mb-6 animate-bounce" />
                  <h3 className="text-lg font-bold mb-2">Thank You! ❤️</h3>
                  <p className="text-xs font-semibold text-zinc-500 leading-relaxed mb-6 px-4">
                    Your contribution of KES {Number(donationAmount).toLocaleString()} has been received successfully. You have supported {campaign.organization.name}'s mission.
                  </p>
                  <button
                    onClick={() => setStep('checkout')}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Donate Again
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
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
