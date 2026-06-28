'use client';

import { motion } from 'framer-motion';
import { Search, ChevronDown, Coffee, CreditCard, Shield, User, Link } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useState } from 'react';

export default function HelpPage() {
  const faqs = [
    {
      category: 'General',
      icon: Coffee,
      questions: [
        { q: 'What is Talent Jar?', a: 'Talent Jar is a premium payment platform built for African creators to receive support (like "buying a chai") directly from their audience via M-Pesa and Cards.' },
        { q: 'How do I get started?', a: 'Simply register for a creator account, set up your profile, and share your unique chai link with your audience.' }
      ]
    },
    {
      category: 'Payments',
      icon: CreditCard,
      questions: [
        { q: 'What payment methods are supported?', a: 'We support M-Pesa (via STK Push) and all major Debit/Credit cards through our partnership with Paystack.' },
        { q: 'How do payouts work?', a: 'Payouts are processed instantly or on a scheduled basis directly to your connected M-Pesa number or Bank account.' }
      ]
    },
    {
      category: 'Account',
      icon: User,
      questions: [
        { q: 'Can I change my username?', a: 'Yes, usernames can be updated in your dashboard settings, provided the new handle is available.' },
        { q: 'Is my data secure?', a: 'Absolutely. We use bank-grade encryption and are fully PCI-DSS compliant through our infrastructure partners.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <main className="py-24 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">How can we <span className="text-brand-primary">help?</span></h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
            <input
              type="text"
              placeholder="Search for articles, guides..."
              className="w-full bg-white border border-black/10 py-5 pl-16 pr-8 rounded-[2rem] card-shadow font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>

        <div className="space-y-16">
          {faqs.map((cat, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                  <cat.icon size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight uppercase">{cat.category}</h2>
              </div>

              <div className="space-y-4">
                {cat.questions.map((item, j) => (
                  <details key={j} className="group bg-white rounded-[2rem] card-shadow border border-black/[0.02] overflow-hidden">
                    <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                      <span className="text-lg font-bold">{item.q}</span>
                      <ChevronDown className="text-brand-muted transition-transform group-open:rotate-180" size={20} />
                    </summary>
                    <div className="px-8 pb-8 text-brand-muted font-medium leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
          <h3 className="text-xl font-bold mb-4 tracking-tight">Couldn't find what you need?</h3>
          <p className="text-brand-muted font-medium mb-8">Our support team is available 24/7 to help you with anything.</p>
          <Link href="/contact" className="btn-primary px-8 py-4 bg-brand-secondary">Contact Support</Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
