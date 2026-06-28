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
    <div className="min-h-screen bg-brand-beige-light text-foreground overflow-x-hidden selection:bg-brand-primary/10 pt-20 md:pt-24">
      <PublicNavbar />

      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Talent Jar",
          "url": "https://chai.nexoracreatives.co.ke",
          "logo": "https://chai.nexoracreatives.co.ke/logo.png",
          "sameAs": [
            "https://twitter.com/talentjar",
            "https://instagram.com/talentjar"
          ],
          "description": "Frictionless creator payments for Africa. Support your favorite developers, designers, and writers via M-Pesa."
        })}
      </Script>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center pt-16 md:pt-24 pb-20 md:pb-32 px-4 sm:px-6 overflow-hidden">
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

        <div className="max-w-4xl mx-auto text-center relative z-10 px-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-5 md:mb-8 leading-[1.1] text-white"
          >
            Monetize your creativity, <span className="text-brand-primary">instantly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-lg lg:text-xl text-white/80 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2"
          >
            The go-to platform for African creators to accept tips, sell digital products, run memberships, take commissions, and organize fundraising — all through M-Pesa and cards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-stretch justify-center gap-0 max-w-xl mx-auto mb-6 px-4 sm:px-0"
          >
            <div className="flex-grow w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-1 sm:gap-2 text-white/60 font-bold">
              <span className="shrink-0 text-white/50 text-[10px] sm:text-xs">chai.nexoracreatives.co.ke/</span>
              <input
                type="text"
                placeholder="yourname"
                value={claimUsername}
                onChange={(e) => setClaimUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="bg-transparent border-none focus:outline-none w-full text-white placeholder:text-white/40 font-bold text-sm sm:text-base"
              />
            </div>
            <button
              onClick={handleClaim}
              className="w-full sm:w-auto bg-brand-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-b-2xl sm:rounded-r-2xl sm:rounded-bl-none font-black text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-all shadow-2xl shadow-brand-primary/20 whitespace-nowrap"
            >
              Claim My Page <ArrowRight size={18} />
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
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-12 text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap size={14} className="text-brand-primary" /> M-Pesa Supported
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield size={14} className="text-brand-primary" /> Secure Payments
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Globe size={14} className="text-brand-primary" /> Bank Transfers
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            Built for creators who <span className="text-brand-primary">mean business</span>
          </h2>
          <p className="text-brand-muted font-medium max-w-md mx-auto text-sm sm:text-base">
            Everything you need to turn your audience into a sustainable income — without the tech headaches.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
          {[
            {
              icon: Zap,
              title: "Fast Payouts",
              desc: "Your earnings land in your M-Pesa or bank account fast — no holding periods, no mystery timelines."
            },
            {
              icon: Globe,
              title: "Fans Anywhere",
              desc: "Supporters from Kenya, Nigeria, the UK — wherever your audience is, they can back you. We handle the currency side."
            },
            {
              icon: Shield,
              title: "No Surprises",
              desc: "Fees shown upfront before you publish anything. What you see is what gets deposited. Simple."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] card-shadow border border-black/[0.02]"
            >
              <div className="w-12 h-12 bg-brand-beige-light rounded-2xl flex items-center justify-center text-brand-primary mb-5 md:mb-8">
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-16 sm:py-24 md:py-32 border-y border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 md:mb-6">
              Up and running in <span className="text-brand-primary">minutes</span>
            </h2>
            <p className="text-brand-muted text-sm sm:text-base max-w-md mx-auto font-medium">
              No tech degree required. If you can post on Instagram, you can set this up.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
            {[
              {
                step: "01",
                title: "Claim Your Link",
                desc: "Sign up and pick a username. Your page is live at chai.nexoracreatives.co.ke/yourname in under a minute."
              },
              {
                step: "02",
                title: "Connect Payouts",
                desc: "Add your M-Pesa or bank details. That's where your money goes — directly, with no middleman holding it."
              },
              {
                step: "03",
                title: "Share With Your Audience",
                desc: "Drop your link in your bio, your YouTube description, or your WhatsApp status. Your fans will take it from there."
              },
              {
                step: "04",
                title: "Watch It Grow",
                desc: "See who's supporting you, where they're coming from, and how much you've made — all in one clean dashboard."
              }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 sm:p-8 rounded-[2rem] bg-brand-beige-light border border-black/[0.02]"
              >
                <div className="text-3xl font-black text-brand-primary/20 mb-3 font-mono">{step.step}</div>
                <h3 className="text-base sm:text-lg font-bold mb-2 tracking-tight">{step.title}</h3>
                <p className="text-brand-muted text-xs sm:text-sm leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 md:mb-6">
            Six ways to get <span className="text-brand-primary">paid</span>
          </h2>
          <p className="text-brand-muted text-sm sm:text-base max-w-lg mx-auto font-medium">
            Whether you make videos, write, design, or run an organization — there's a revenue stream here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
          {[
            {
              title: "Digital Storefront",
              desc: "Sell presets, e-books, templates, or audio packs. Files are hosted securely and download links expire after use."
            },
            {
              title: "Monthly Memberships",
              desc: "Let your biggest supporters subscribe for exclusive perks. M-Pesa renewal reminders go out automatically before the due date."
            },
            {
              title: "Custom Commissions",
              desc: "Take bookings for artwork, voice-overs, design work, or consulting. Clients fill in a brief, you get paid before you start."
            },
            {
              title: "Gated Posts",
              desc: "Write premium content and lock it behind a one-time payment, a membership tier, or supporter-only access."
            },
            {
              title: "Organization Accounts",
              desc: "Ideal for clubs, NGOs, and media houses. Manage multiple admins, run fundraising campaigns, and keep finances centralized."
            },
            {
              title: "Supporter Insights",
              desc: "See who your top backers are, where they found your page, and what keeps them coming back. Your built-in audience CRM."
            }
          ].map((offer, i) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] card-shadow border border-black/[0.02]"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-4">
                Revenue Stream
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">{offer.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed font-medium">{offer.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Developer Hub Section */}
      <section className="bg-zinc-950 py-16 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest mb-5 md:mb-6">
                <Terminal size={14} /> Developer Hub
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
                Built for <span className="text-brand-primary">developers.</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                Drop a payment button into your React app, Flutter project, or plain HTML site. Your users pay without ever leaving your product.
              </p>

              <div className="flex flex-col gap-4 md:gap-6">
                {[
                  { title: "One-line setup", desc: "Paste a single script tag and your widget is live. No build steps." },
                  { title: "Native mobile checkout", desc: "In-app M-Pesa or card payment — no browser redirects for your users." },
                  { title: "Webhooks on every event", desc: "Get notified the moment a payment completes. Trigger whatever logic you need." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 md:gap-4">
                    <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-0.5">{item.title}</h4>
                      <p className="text-zinc-500 text-xs sm:text-sm">{item.desc}</p>
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
                      className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${devTab === tab ? 'text-brand-primary bg-white/5' : 'text-zinc-500 hover:text-white'
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
                      <p className="text-brand-primary mb-4">npm install talent-jar-react</p>
                      <p className="text-zinc-500 mb-2">// 2. Drop in the button with custom modes</p>
                      <p className="text-blue-400">import <span className="text-purple-400">{'{ ChaiButton }'}</span> from <span className="text-orange-400">'talent-jar-react'</span>;</p>
                      <br />
                      <p className="text-blue-400">{'<'}<span className="text-yellow-400">ChaiButton</span></p>
                      <p className="ml-4 text-zinc-300">username=<span className="text-orange-400">"nexora"</span></p>
                      <p className="ml-4 text-zinc-300">mode=<span className="text-orange-400">"PRODUCT"</span> <span className="text-zinc-500">// TIP, GOAL, PRODUCT, MEMBERSHIP, COMMISSION</span></p>
                      <p className="ml-4 text-zinc-300">itemId=<span className="text-orange-400">"prod_abc123"</span></p>
                      <p className="ml-4 text-zinc-300">amount={<span className="text-purple-400">500</span>}</p>
                      <p className="ml-4 text-zinc-300">onSuccess={<span className="text-purple-400">(ref) ={'>'} congratulate(ref)</span>}</p>
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
