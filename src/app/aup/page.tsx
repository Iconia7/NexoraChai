'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function AUPPage() {
  const categories = [
    {
      title: 'Prohibited Digital Storefront Assets',
      items: [
        'Pirated materials, cracks, or unauthorized key generators.',
        'Malicious software, viruses, spyware, or keyloggers.',
        'Credit card details, accounts logins, or compromised personal data.',
        'Stolen templates, graphics, or code without commercial redistribution rights.',
        'Regulated or restricted commodities (e.g. medical files, pharmaceuticals).'
      ]
    },
    {
      title: 'Prohibited Gated Content & Media',
      items: [
        'Explicit, adult, or non-consensual sexual media.',
        'Hate speech, extreme violence, or graphic depictions of harm.',
        'Harassment, doxxing, or defamatory personal exposés.',
        'Extremist propaganda, conspiracy theories inciting violence, or threat media.'
      ]
    },
    {
      title: 'Prohibited Financial Activities',
      items: [
        'Ponzi schemes, multi-level marketing (MLM) structures, or quick-cash programs.',
        'Unregulated charitable solicitation without legal NGO documentation.',
        'Illegal lotteries, raffles, or unlicensed sweepstakes.',
        'Money laundering, mixing card payments, or circular STK pushes.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
      <PublicNavbar />

      <main className="py-24 px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Acceptable Use <span className="text-brand-primary">Policy.</span></h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: June 2026</p>

          <p className="text-xl text-brand-muted font-medium mb-12 leading-relaxed">
            As a SaaS creator platform facilitating direct financial transactions across Africa and globally, Nexora Chai enforces strict guidelines on what digital products can be sold, posts gated, or campaigns launched.
          </p>

          <div className="space-y-16">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-brand-primary">{cat.title}</h2>
                <ul className="space-y-4">
                  {cat.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-brand-muted font-medium leading-relaxed">
                      <div className="w-2 h-2 rounded-full bg-brand-secondary shrink-0 mt-2.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <h3 className="text-xl font-bold mb-4 tracking-tight">Encountered a Violation?</h3>
             <p className="text-brand-muted font-medium mb-8">Help us maintain platform integrity. Report abuse or illegal content immediately.</p>
             <Link href="/takedown" className="text-brand-primary font-bold uppercase tracking-widest text-xs hover:underline">File a Takedown Report</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
