'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Loader2,
  Calendar,
  ArrowLeft,
  Shield,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function CommissionOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const queryToken = searchParams.get('token') || searchParams.get('ref');
    if (queryToken) {
      setToken(queryToken);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/commissions/orders/public/${token}`);
      setOrder(res.data);
    } catch (err: any) {
      console.error('Failed to load order details', err);
      addToast(err.response?.data?.error || 'Order details not found or expired', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrderDetails();
    }
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F5] text-foreground font-sans animate-pulse">
      <PublicNavbar />
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="h-6 w-24 bg-gray-200 rounded mb-8" />
        <div className="h-10 w-3/4 bg-gray-300 rounded mb-4" />
        <div className="h-4 w-40 bg-gray-200 rounded mb-12" />
        <div className="h-40 w-full bg-gray-200 rounded-3xl mb-6" />
      </div>
      <PublicFooter />
    </div>
  );

  if (!token || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige-light px-6 text-center">
       <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} />
       </div>
       <h1 className="text-3xl font-bold mb-2">Order lookup failed</h1>
       <p className="text-brand-muted font-medium mb-8">Please make sure you have a valid secure token reference in the link URL.</p>
       <Link href="/" className="btn-primary px-8 py-4 bg-[#914D00] text-sm uppercase tracking-widest font-bold text-white rounded-xl">Go Home</Link>
    </div>
  );

  // Status timeline steps
  const steps = [
    { label: 'Placed', active: true },
    { label: 'Paid', active: ['PAID', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) },
    { label: 'In Progress', active: ['IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) },
    { label: 'Delivered', active: ['DELIVERED', 'COMPLETED'].includes(order.status) },
    { label: 'Completed', active: order.status === 'COMPLETED' }
  ];

  let requirementsObj: Record<string, string> = {};
  try {
    requirementsObj = JSON.parse(order.requirements);
  } catch (e) {}

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href={`/${order.creator?.username}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:opacity-85 text-[#914D00]"
          >
            <ArrowLeft size={16} /> Visit Creator Page
          </Link>
          <span className="text-[10px] font-mono font-bold text-zinc-400">REF: {order.gatewayReference}</span>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-black/[0.02] shadow-xl p-6 md:p-12 space-y-10">
          {/* Creator Header */}
          <div className="flex items-center gap-4 border-b border-black/[0.05] pb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-black/5 shrink-0 bg-zinc-100">
              {order.creator?.avatarUrl ? (
                <Image 
                  src={order.creator.avatarUrl}
                  alt={order.creator.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Sparkles size={24} className="m-3 text-zinc-400" />
              )}
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight text-zinc-500 uppercase tracking-wider">Hired Creator</p>
              <p className="font-bold text-lg text-zinc-900 mt-0.5">{order.creator?.displayName}</p>
            </div>
          </div>

          {/* Interactive Timeline */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-6 text-center">Fulfillment Status Timeline</h3>
            <div className="flex items-center justify-between relative max-w-md mx-auto">
              <div className="absolute left-0 right-0 h-1 bg-zinc-100 z-0 top-1/2 -translate-y-1/2 rounded" />
              <div 
                className="absolute left-0 h-1 bg-green-500 z-0 top-1/2 -translate-y-1/2 rounded transition-all duration-500" 
                style={{
                  width: `${
                    order.status === 'COMPLETED' ? 100 :
                    order.status === 'DELIVERED' ? 75 :
                    order.status === 'IN_PROGRESS' ? 50 :
                    ['PAID', 'PENDING_PAYMENT'].includes(order.status) ? 25 : 0
                  }%`
                }}
              />
              
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center z-10 relative">
                  <div 
                    className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step.active 
                        ? 'bg-green-500 border-white text-white shadow-lg' 
                        : 'bg-white border-zinc-200 text-zinc-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 ${
                    step.active ? 'text-green-600' : 'text-zinc-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {order.status === 'CANCELLED' && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-2xl text-center">
                This commission order was canceled by the creator. A reversal or refund will be processed according to platform policies.
              </div>
            )}
          </div>

          {/* Details Package Info */}
          <div className="bg-zinc-50/50 p-6 rounded-3xl border border-black/[0.02] space-y-4">
            <h4 className="font-extrabold text-lg tracking-tight text-zinc-900">{order.service?.title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">{order.service?.description || 'No description provided.'}</p>
            
            <div className="flex flex-wrap justify-between items-center gap-4 border-t border-black/5 pt-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Total Settled Amount</span>
                <p className="font-extrabold text-sm text-zinc-800">KES {Number(order.amount).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Delivery Timeframe</span>
                <span className="text-xs text-zinc-800 font-bold">{order.service?.deliveryDays} Days package</span>
              </div>
            </div>
          </div>

          {/* User Answers details */}
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
              <FileText size={14} /> Submitted Project Requirements
            </h4>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-black/5 space-y-3">
              {Object.entries(requirementsObj).map(([question, answer], idx) => (
                <div key={idx} className="text-xs font-semibold">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">{question}</span>
                  <span className="text-zinc-800 mt-1 block leading-relaxed">{answer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables section */}
          {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && order.deliveries && order.deliveries.length > 0 && (
            <div className="border-t border-black/[0.05] pt-10">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-6">
                Completed Project Deliverables
              </h3>
              
              <div className="space-y-4">
                {order.deliveries.map((delivery: any) => (
                  <div key={delivery.id} className="border border-purple-100 rounded-3xl p-6 bg-purple-500/5 space-y-4">
                    <p className="text-xs font-medium text-zinc-700 leading-relaxed italic">
                      "{delivery.message}"
                    </p>

                    {delivery.downloadUrl && (
                      <a
                        href={delivery.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-purple-200/20 hover:border-purple-300 hover:scale-[1.01] transition-all group shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Sparkles size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate pr-2 text-zinc-800">{delivery.fileName}</p>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase">Download Completed File</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-full bg-purple-500 text-white shadow group-hover:scale-110 transition-transform">
                          <Download size={16} />
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function CommissionOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="animate-spin text-[#914D00]" size={32} />
      </div>
    }>
      <CommissionOrderContent />
    </Suspense>
  );
}
