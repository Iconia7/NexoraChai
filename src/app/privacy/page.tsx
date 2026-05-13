'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Data Collection',
      content: 'We collect information you provide when creating an account, such as your email, name, and profile details. For supporters, we collect payment information required to process transactions securely via our partners.'
    },
    {
      title: '2. Use of Information',
      content: 'Your information is used to provide our services, process payments, and communicate with you about your account. We never sell your personal data to third parties.'
    },
    {
      title: '3. Data Security',
      content: 'All data is stored securely using industry-standard encryption. Financial transactions are handled by PCI-DSS compliant partners like Paystack and Safaricom Daraja.'
    },
    {
      title: '4. Your Rights',
      content: 'You have the right to access, correct, or delete your personal information at any time via your dashboard settings.'
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
          <h1 className="text-5xl font-black mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: May 2026</p>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-2xl font-black mb-6 tracking-tight text-brand-secondary">{section.title}</h2>
                <p className="text-lg text-brand-muted font-medium leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <h3 className="text-xl font-black mb-4 tracking-tight">Privacy Concerns?</h3>
             <p className="text-brand-muted font-medium mb-8">We take your data privacy seriously. Reach out to our DPO for any queries.</p>
             <Link href="mailto:privacy@nexora.co.ke" className="text-brand-secondary font-black uppercase tracking-widest text-xs hover:underline">Contact Privacy Officer</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
