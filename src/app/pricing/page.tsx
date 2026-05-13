'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, Star } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <main className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Transparent <span className="text-brand-primary">Pricing.</span></h1>
            <p className="text-xl text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">
                We only win when you win. No monthly fees, no hidden charges. Just simple, artisanal finance.
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[4rem] card-shadow border-4 border-brand-primary/10 overflow-hidden"
            >
                <div className="p-12 md:p-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                        <Star size={12} className="fill-brand-primary" /> Most Popular
                    </div>
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Creator Pro</h2>
                    <div className="flex items-center justify-center gap-1 mb-8">
                        <span className="text-6xl font-black text-brand-primary">2%</span>
                        <span className="text-brand-muted font-bold">per transaction</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
                        {[
                            'Custom Creator Link',
                            'Unlimited Chai Support',
                            'M-Pesa & Card Integration',
                            'Instant Payout Access',
                            'Dashboard Analytics',
                            'Split Payment Support',
                            'Artisanal Profile Customization',
                            'Priority Support'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center shrink-0">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                                <span className="font-bold text-brand-muted">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Link href="/register" className="btn-primary py-6 px-12 text-xl font-black bg-[#914D00] shadow-2xl shadow-brand-primary/20 inline-flex items-center gap-3">
                        Start Creating Now <Zap size={24} />
                    </Link>
                </div>

                <div className="bg-[#F9FAFB] border-t border-black/5 p-12 text-center">
                    <p className="text-sm font-bold text-brand-muted">
                        * Note: Third-party gateway fees (e.g., Paystack/Daraja) apply at cost. <Link href="/fees" className="text-brand-primary underline">See full fee breakdown</Link>.
                    </p>
                </div>
            </motion.div>
        </div>

        {/* Enterprise */}
        <div className="mt-24 text-center">
            <h3 className="text-2xl font-black mb-4 tracking-tight">Large scale creator?</h3>
            <p className="text-brand-muted font-medium mb-8 leading-relaxed max-w-xl mx-auto">
                If you process over KES 1M per month, we offer custom enterprise rates and dedicated account management.
            </p>
            <Link href="/contact" className="text-brand-primary font-black uppercase tracking-widest text-xs hover:underline">Talk to our Sales Team</Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
