'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';

import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground overflow-x-hidden selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Nexora Chai",
          "url": "https://chai.nexoracreatives.co.ke",
          "logo": "https://chai.nexoracreatives.co.ke/logo.png",
          "sameAs": [
            "https://twitter.com/nexorachai",
            "https://instagram.com/nexorachai"
          ],
          "description": "Frictionless creator payments for Africa. Support your favorite developers, designers, and writers via M-Pesa."
        })}
      </Script>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 px-6 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-beige-light" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 md:mb-8 leading-[1.1] text-white"
          >
            Fund your creativity, <span className="text-brand-primary">instantly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-xl text-white/80 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The premium platform for African creators to receive support directly from their audience. Secure, fast, and built for your growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-0 max-w-xl mx-auto mb-16 px-4 md:px-0"
          >
            <div className="flex-1 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none px-4 md:px-6 py-4 flex items-center gap-1 md:gap-2 text-white/60 font-bold text-sm md:text-lg">
              <span className="shrink-0">chai.nexoracreatives.co.ke/</span>
              <input
                type="text"
                placeholder="username"
                className="bg-transparent border-none focus:outline-none w-full text-white placeholder:text-white/40"
              />
            </div>
            <button className="w-full md:w-auto bg-brand-primary text-white px-8 py-4 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-primary/90 transition-all shadow-2xl shadow-brand-primary/20 whitespace-nowrap">
              Claim Link <ArrowRight size={20} />
            </button>
          </motion.div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-white/60 font-bold text-sm uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-brand-primary" /> M-Pesa Supported
            </div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-brand-primary" /> PCI DSS Compliant
            </div>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-brand-primary" /> Bank Transfers
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Instant Payouts",
              desc: "Get access to your funds immediately. Connect directly to mobile money or bank accounts with zero delays."
            },
            {
              icon: Globe,
              title: "Global Reach",
              desc: "Accept support from anywhere in the world. We handle currency conversions seamlessly so you don't have to."
            },
            {
              icon: Shield,
              title: "Total Transparency",
              desc: "Clear, upfront fees. What you see is what you get, ensuring absolute trust between you and your supporters."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] card-shadow border border-black/[0.02]"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-beige-light rounded-2xl flex items-center justify-center text-brand-primary mb-6 md:mb-8">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-brand-muted text-sm md:text-base leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
