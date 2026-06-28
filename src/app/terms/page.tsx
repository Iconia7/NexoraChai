'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Talent Jar, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
    },
    {
      title: '2. Creator Responsibilities',
      content: 'Creators are solely responsible for the digital products they sell, membership perks they offer, commission services they deliver, and gated posts they publish. Creators must have all appropriate rights to their media and products. Talent Jar reserves the right to suspend accounts violating our guidelines.'
    },
    {
      title: '3. Fees, Payments, & Splits',
      content: 'Talent Jar charges a standard 2.0% platform fee for M-Pesa STK push checkouts and 5.0% for card payments. Split payouts are routed directly to creator subaccounts. Digital product orders, memberships, and commissions checkouts are final, and refunds are subject to gatekeeper approvals.'
    },
    {
      title: '4. Organization & Multi-Admin Compliance',
      content: 'Organizations, NGOs, and clubs must configure a unified bank subaccount. All designated admins share collaborative accountability for joint fundraising campaigns, team invitations, and centralized balance allocations.'
    },
    {
      title: '5. Prohibited Content',
      content: 'Creators may not use Talent Jar to host or distribute malicious software, fraudulent schemes, explicit/unauthorized media, or solicit funds for illegal activities.'
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
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: May 2026</p>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-brand-primary">{section.title}</h2>
                <p className="text-lg text-brand-muted font-medium leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <h3 className="text-xl font-bold mb-4 tracking-tight">Have questions?</h3>
             <p className="text-brand-muted font-medium mb-8">Our legal team is here to help you understand our terms.</p>
             <Link href="mailto:legal@nexora.co.ke" className="text-brand-primary font-bold uppercase tracking-widest text-xs hover:underline">Contact Legal Support</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
