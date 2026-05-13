'use client';

import { motion } from 'framer-motion';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <main className="py-24 px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black mb-6 tracking-tight">Fee <span className="text-brand-primary">Breakdown.</span></h1>
          <p className="text-xl text-brand-muted font-medium mb-16 leading-relaxed">
            We believe in complete transparency. Here is exactly where every shilling goes when you receive a Chai.
          </p>

          <div className="space-y-12">
            {/* Nexora Fee */}
            <div className="bg-white p-10 rounded-[3rem] card-shadow border-l-8 border-brand-primary">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black mb-1 tracking-tight">Nexora Platform Fee</h2>
                        <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Our Service Cost</p>
                    </div>
                    <span className="text-4xl font-black text-brand-primary">2.0%</span>
                </div>
                <p className="text-lg text-brand-muted font-medium leading-relaxed mb-6">
                    This covers our infrastructure, artisanal design updates, security monitoring, and 24/7 creator support.
                </p>
                <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-widest">
                    <CheckCircle2 size={16} /> Included in all plans
                </div>
            </div>

            {/* Gateway Fees */}
            <div className="bg-white p-10 rounded-[3rem] card-shadow border-l-8 border-brand-secondary">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black mb-1 tracking-tight">Payment Gateway Fees</h2>
                        <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Third-Party Processing</p>
                    </div>
                    <span className="text-xl font-black text-brand-secondary">At Cost</span>
                </div>
                
                <div className="space-y-6">
                    <div className="p-6 bg-brand-beige-light rounded-2xl border border-black/5">
                        <p className="font-bold mb-2 flex items-center gap-2">M-Pesa (Daraja API)</p>
                        <p className="text-sm text-brand-muted font-medium">Standard carrier rates apply. Typically KES 5 - KES 30 depending on transaction size.</p>
                    </div>
                    <div className="p-6 bg-brand-beige-light rounded-2xl border border-black/5">
                        <p className="font-bold mb-2 flex items-center gap-2">Card Payments (Paystack)</p>
                        <p className="text-sm text-brand-muted font-medium">1.5% for local cards, 3.9% for international cards + KES 10 base fee.</p>
                    </div>
                </div>
            </div>

            {/* Payouts */}
            <div className="bg-[#F3E5D8] p-10 rounded-[3rem] card-shadow border border-black/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary">
                        <Info size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Withdrawals & Payouts</h2>
                </div>
                <p className="text-lg text-brand-muted font-medium leading-relaxed mb-6">
                    We offer **Instant Payouts** to M-Pesa. Withdrawal fees are capped at KES 50 to ensure you keep more of your earnings.
                </p>
                <Link href="/help" className="text-brand-primary font-black uppercase tracking-widest text-xs hover:underline">Read more about payouts</Link>
            </div>
          </div>

          <div className="mt-24 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-black mb-4 tracking-tight">Anti-Fraud Protection</h3>
             <p className="text-brand-muted font-medium mb-8">
                Fees also fund our advanced fraud detection systems, keeping both creators and supporters safe from chargebacks and fraudulent STK pushes.
             </p>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
