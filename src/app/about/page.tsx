'use client';

import { motion } from 'framer-motion';
import { Coffee, Heart, Zap, Shield, Globe, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function AboutPage() {
  const stats = [
    { label: 'Creators Joined', value: '10k+' },
    { label: 'Chais Bought', value: '50k+' },
    { label: 'Countries', value: '15' },
    { label: 'Payouts Made', value: 'KES 20M+' },
  ];

  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <main>
        {/* Hero */}
        <section className="py-24 px-8 max-w-5xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]">
                    Empowering the <span className="text-brand-primary">African Creative</span> Economy.
                </h1>
                <p className="text-xl text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">
                    Nexora Chai was built to bridge the gap between passion and sustainability for creators across the continent. We make support frictionless, fast, and local.
                </p>
            </motion.div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white border-y border-black/5">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-12">
                {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                        <p className="text-4xl font-bold text-brand-primary mb-2">{stat.value}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Values */}
        <section className="py-32 px-8 max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-bold tracking-tight mb-4">Our Core Values</h2>
                <div className="w-20 h-1.5 bg-brand-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { title: 'Local First', icon: Globe, desc: 'Optimized for African payment methods like M-Pesa and local cards.' },
                    { title: 'Artisanal Design', icon: Heart, desc: 'We believe finance should be beautiful, not just functional.' },
                    { title: 'Absolute Trust', icon: Shield, desc: 'Bank-grade security powered by ParsePesa infrastructure.' },
                ].map((v, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                        <div className="w-14 h-14 bg-brand-beige-light text-brand-primary rounded-2xl flex items-center justify-center mb-8">
                            <v.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 tracking-tight">{v.title}</h3>
                        <p className="text-brand-muted font-medium leading-relaxed">{v.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Mission */}
        <section className="py-32 bg-[#F3E5D8] relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight leading-tight">
                    "We don't just process payments. We fuel dreams, one Chai at a time."
                </h2>
                <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
                        <Image src="/avatar-1.png" alt="Newton" width={64} height={64} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-lg">Newton Nderitu</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Founder, Nexora Chai</p>
                    </div>
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/20 rounded-full blur-[120px]" />
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
