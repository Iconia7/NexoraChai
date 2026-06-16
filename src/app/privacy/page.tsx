'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Data Collection',
      content: 'We collect information you provide when creating an account, such as your name, email, profile details, and payout configuration. For supporters making checkouts (tips, digital downloads, memberships, commissions), we collect contact information (email/phone) and payment metadata. We also log IP addresses and user agents for secure file download tracking on Cloudflare R2.'
    },
    {
      title: '2. Supporter CRM and Traffic Analytics',
      content: 'patron data (name, contact details, total contribution sums) is consolidated into the creator’s Supporter CRM dashboard. We also track traffic sources (e.g. Twitter/X, Instagram, YouTube) to help creators understand user conversion rates. We never sell this information to third-party advertisers.'
    },
    {
      title: '3. Communications & Alerts',
      content: 'We use contact details to dispatch automated transactions updates, secure single-use access links, and send membership renewal alerts (via Africa’s Talking SMS). Sensitive payout modifications also trigger immediate security alerts via Zoho SMTP email and SMS.'
    },
    {
      title: '4. Data Security & Gateways',
      content: 'All details are stored securely using industry-standard encryption. Transactions are processed directly by PCI-DSS compliant partners (Paystack and Safaricom Daraja STK Push), and your full card credentials are never stored on our servers.'
    },
    {
      title: '5. Your Rights',
      content: 'You have the right to inspect, edit, or purge your personal data or creator profile information at any time via your dashboard settings.'
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
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: May 2026</p>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-brand-secondary">{section.title}</h2>
                <p className="text-lg text-brand-muted font-medium leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <h3 className="text-xl font-bold mb-4 tracking-tight">Privacy Concerns?</h3>
             <p className="text-brand-muted font-medium mb-8">We take your data privacy seriously. Reach out to our DPO for any queries.</p>
             <Link href="mailto:privacy@nexora.co.ke" className="text-brand-secondary font-bold uppercase tracking-widest text-xs hover:underline">Contact Privacy Officer</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
