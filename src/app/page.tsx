'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, ArrowRight, Terminal, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import axios from 'axios';

import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Landing() {
  const [devTab, setDevTab] = useState<'react' | 'flutter' | 'script'>('react');
  const [claimUsername, setClaimUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (claimUsername.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/check-username/${claimUsername}`);
        setIsAvailable(res.data.available);
      } catch (err) {
        console.error('Check failed');
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [claimUsername]);

  const handleClaim = () => {
    if (claimUsername.trim()) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('claimed_username', claimUsername.trim().toLowerCase());
      }
      router.push(`/register?username=${encodeURIComponent(claimUsername.trim().toLowerCase())}`);
    } else {
      router.push('/register');
    }
  };

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
            className="flex flex-col md:flex-row items-center justify-center gap-0 max-w-xl mx-auto mb-6 px-4 md:px-0"
          >
            <div className="flex-grow w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none px-4 md:px-6 py-4 flex items-center gap-1 md:gap-2 text-white/60 font-bold text-sm md:text-lg">
              <span className="shrink-0 text-white/50">chai.nexoracreatives.co.ke/</span>
              <input
                type="text"
                placeholder="username"
                value={claimUsername}
                onChange={(e) => setClaimUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="bg-transparent border-none focus:outline-none w-full text-white placeholder:text-white/40 font-bold"
              />
            </div>
            <button 
              onClick={handleClaim}
              className="w-full md:w-auto bg-brand-primary text-white px-8 py-4 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-primary/90 transition-all shadow-2xl shadow-brand-primary/20 whitespace-nowrap"
            >
              Claim Link <ArrowRight size={20} />
            </button>
          </motion.div>

          {/* Availability Feedback Badge */}
          {claimUsername.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              {checking ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                  Checking availability...
                </span>
              ) : isAvailable ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-green-500/30">
                  <CheckCircle2 size={12} /> chai.nexoracreatives.co.ke/{claimUsername} is available!
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-red-500/30">
                  Username already taken
                </span>
              )}
            </motion.div>
          )}

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

      {/* How it Works Section */}
      <section className="bg-white py-32 border-y border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              How it <span className="text-brand-primary">Works</span>
            </h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto font-medium">
              Start accepting support from your fans in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Claim Your Link",
                desc: "Sign up instantly and claim your custom nexora-chai handle to share with your audience."
              },
              {
                step: "02",
                title: "Configure Payouts",
                desc: "Choose between direct M-Pesa withdrawals or Paystack multi-country bank settlement."
              },
              {
                step: "03",
                title: "Share & Embed",
                desc: "Put your link on your socials, or embed our customizable React/Flutter SDKs in your apps."
              },
              {
                step: "04",
                title: "Track & Grow",
                desc: "View supporters, export earnings, and track traffic sources (Twitter, Instagram, YouTube) in real-time."
              }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-[2rem] bg-brand-beige-light border border-black/[0.02]"
              >
                <div className="text-4xl font-black text-brand-primary/20 mb-6 font-mono">{step.step}</div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-brand-muted text-xs md:text-sm leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Everything you need to <span className="text-brand-primary">succeed.</span>
          </h2>
          <p className="text-brand-muted text-lg max-w-xl mx-auto font-medium">
            Designed for creators who want premium, secure, and hassle-free support options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Supporter Traffic Analytics",
              desc: "Know where your tips originate. Track visitors from Twitter/X, Instagram, YouTube, and Facebook to measure your conversion rates across networks."
            },
            {
              title: "Multi-Country Payout Channels",
              desc: "Get payouts in your local currency. Connect Kenya M-Pesa Till/Paybill numbers, or bank transfers across Nigeria, Ghana, South Africa, and more using Paystack."
            },
            {
              title: "Clickable Creator Profiles",
              desc: "Provide context for your supporters. Highlight your biography, display name, creator category, and direct links to your active social networks."
            },
            {
              title: "Developer Widgets & SDKs",
              desc: "Integrate seamlessly into any developer workflow with official packages for React, Flutter, and native HTML embed tags."
            }
          ].map((offer, i) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] card-shadow border border-black/[0.02]"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-6">
                Feature
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">{offer.title}</h3>
              <p className="text-brand-muted text-sm md:text-base leading-relaxed font-medium">{offer.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Developer Hub Section */}
      <section className="bg-zinc-950 py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest mb-6">
                <Terminal size={14} /> Developer Hub
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Built for <span className="text-brand-primary">Builders.</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed max-w-xl">
                Integrate Nexora Chai directly into your apps and websites. Whether you're building a React dashboard, a Flutter mobile app, or a simple blog, our SDKs make M-Pesa monetization a breeze.
              </p>
              
              <div className="flex flex-col gap-6">
                 {[
                   { title: "One-line Integration", desc: "Copy-paste a single script tag and you're live." },
                   { title: "Native Mobile Checkout", desc: "No redirects. Secure in-app payments for your fans." },
                   { title: "Webhooks & Events", desc: "Listen for payments and trigger custom app logic." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} className="text-brand-primary" />
                     </div>
                     <div>
                       <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                       <p className="text-zinc-500 text-sm">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-brand-primary/20 blur-3xl rounded-full opacity-50" />
              <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {/* Code Tabs */}
                <div className="flex border-b border-white/5">
                  {['react', 'flutter', 'script'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDevTab(tab as any)}
                      className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                        devTab === tab ? 'text-brand-primary bg-white/5' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Code Window */}
                <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                  {devTab === 'react' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-zinc-500 mb-2">// 1. Install SDK</p>
                      <p className="text-brand-primary mb-4">npm install nexora-chai-react</p>
                      <p className="text-zinc-500 mb-2">// 2. Drop in the button</p>
                      <p className="text-blue-400">import <span className="text-purple-400">{'{ ChaiButton }'}</span> from <span className="text-orange-400">'nexora-chai-react'</span>;</p>
                      <br />
                      <p className="text-blue-400">{'<'}<span className="text-yellow-400">ChaiButton</span></p>
                      <p className="ml-4 text-zinc-300">username=<span className="text-orange-400">"nexora"</span></p>
                      <p className="ml-4 text-zinc-300">amount={<span className="text-purple-400">100</span>}</p>
                      <p className="ml-4 text-zinc-300">onSuccess={<span className="text-purple-400">() ={'>'} congratulate()</span>}</p>
                      <p className="text-blue-400">{'/>'}</p>
                    </motion.div>
                  )}
                  {devTab === 'flutter' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-zinc-500 mb-2">// 1. Add to pubspec.yaml</p>
                      <p className="text-brand-primary mb-4">nexora_chai_flutter: ^1.0.0</p>
                      <p className="text-zinc-500 mb-2">// 2. Launch checkout</p>
                      <p className="text-blue-400">showDialog(</p>
                      <p className="ml-4 text-zinc-300">context: context,</p>
                      <p className="ml-4 text-zinc-300">builder: (context) ={'>'} <span className="text-yellow-400">ChaiCheckoutView</span>(</p>
                      <p className="ml-8 text-zinc-300">username: <span className="text-orange-400">'nexora'</span>,</p>
                      <p className="ml-8 text-zinc-300">onCompleted: () ={'>'} print(<span className="text-orange-400">'Success!'</span>),</p>
                      <p className="ml-4 text-zinc-300">),</p>
                      <p className="text-blue-400">);</p>
                    </motion.div>
                  )}
                  {devTab === 'script' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-zinc-500 mb-2">// Paste in your HTML head</p>
                      <p className="text-blue-400">{'<'}<span className="text-yellow-400">script</span></p>
                      <p className="ml-4 text-zinc-300">src=<span className="text-orange-400">"https://chai.nexoracreatives.co.ke/widget.js"</span></p>
                      <p className="ml-4 text-zinc-300">data-username=<span className="text-orange-400">"nexora"</span></p>
                      <p className="ml-4 text-zinc-300">data-color=<span className="text-orange-400">"#914D00"</span></p>
                      <p className="text-blue-400">{'></'}<span className="text-yellow-400">script</span>{'>'}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
