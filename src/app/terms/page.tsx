'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Nexora Chai, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
    },
    {
      title: '2. Creator Responsibilities',
      content: 'Creators are responsible for the content they publish and for ensuring that they have the right to receive payments. Nexora Chai reserves the right to suspend accounts that violate our community guidelines.'
    },
    {
      title: '3. Fees and Payments',
      content: 'Nexora Chai charges a flat 2% processing fee on all transactions. Third-party payment gateways (M-Pesa, Paystack) may charge additional fees. All payouts are processed according to our payout schedule.'
    },
    {
      title: '4. Prohibited Content',
      content: 'Creators may not use Nexora Chai to solicit funds for illegal activities, explicit content, or fraudulent schemes.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <main className="py-24 px-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: May 2026</p>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-2xl font-black mb-6 tracking-tight text-brand-primary">{section.title}</h2>
                <p className="text-lg text-brand-muted font-medium leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <h3 className="text-xl font-black mb-4 tracking-tight">Have questions?</h3>
             <p className="text-brand-muted font-medium mb-8">Our legal team is here to help you understand our terms.</p>
             <Link href="mailto:legal@nexora.co.ke" className="text-brand-primary font-black uppercase tracking-widest text-xs hover:underline">Contact Legal Support</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
