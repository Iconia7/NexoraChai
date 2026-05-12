'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, Shield, Zap, ArrowRight, Heart } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050A15] text-slate-200 overflow-x-hidden">
      {/* Hero Section */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">N</div>
          <span className="font-bold text-xl tracking-tight">Nexora Chai</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-bold hover:text-accent transition-colors">Login</Link>
          <Link href="/register" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-[1.05] transition-transform shadow-xl">Get Started</Link>
        </div>
      </nav>

      <section className="relative pt-20 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-full text-accent text-xs font-black uppercase tracking-widest mb-8"
          >
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Built for Africa's Creator Economy
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Frictionless Payments for <span className="text-gradient">African Creators.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Receive support from your fans via M-Pesa and Cards instantly. No complex setup, no high fees. Just share your link and get paid.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="w-full sm:w-auto bg-accent text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-[0.95] transition-transform shadow-2xl shadow-accent/20">
              Start My Page <ArrowRight size={20} />
            </Link>
            <Link href="/docs" className="w-full sm:w-auto glass px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/5 transition-colors">
              How it works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Instant M-Pesa", desc: "No manual confirmations. We trigger STK pushes directly to your fans' phones." },
            { icon: Shield, title: "Direct Payouts", desc: "Funds are automatically split and settled directly to your M-Pesa account via Paystack." },
            { icon: Coffee, title: "Custom Tiers", desc: "Create your own support levels: Buy me a Chai, a Samosa, or Lunch." }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 rounded-[3rem]"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="glass rounded-[4rem] p-16 text-center border border-accent/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
          <h2 className="text-4xl font-bold mb-12">Empowering the next generation.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Creators", value: "500+" },
              { label: "Total Supported", value: "KES 2M+" },
              { label: "Transaction Time", value: "< 2s" },
              { label: "Platform Fee", value: "5%" }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-accent mb-2">{stat.value}</p>
                <p className="text-slate-400 font-medium text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black text-sm">N</div>
              <span className="font-bold text-lg tracking-tight">Nexora Chai</span>
            </div>
            <p className="text-slate-500 max-w-sm">Built with passion for the African creator economy. Securely powered by Paystack.</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-4">
              <p className="font-bold text-sm uppercase tracking-widest text-slate-500">Platform</p>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Creators</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-sm uppercase tracking-widest text-slate-500">Legal</p>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-accent transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-slate-600 text-sm">
          <p>© 2026 Nexora Creative Solutions. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <Heart size={16} className="text-accent" />
            <span>Handcrafted in Kenya 🇰🇪</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
