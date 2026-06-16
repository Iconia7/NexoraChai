'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function TakedownPage() {
  const steps = [
    {
      title: '1. Identification of IP Work',
      content: 'Identify in detail the copyrighted work, proprietary code, or template that you believe has been infringed upon, including specific source URLs.'
    },
    {
      title: '2. Location on Nexora Chai',
      content: 'Provide the exact Nexora Chai profile username, post slug, or product checkout link where the allegedly infringing asset is hosted.'
    },
    {
      title: '3. Contact Details & Declaration',
      content: 'Provide your contact information (name, company, email, phone) alongside a declaration made in good faith that the disputed use is not authorized by the owner.'
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
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Takedown & IP Policy</h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: June 2026</p>

          <p className="text-xl text-brand-muted font-medium mb-12 leading-relaxed">
            Nexora Chai respects intellectual property rights and expects its creators to do the same. We respond expeditiously to legitimate notices of claimed copyright or trademark infringement.
          </p>

          <div className="space-y-12 mb-16">
            <h2 className="text-2xl font-bold tracking-tight">Filing an IP Infringement Claim</h2>
            <p className="text-brand-muted font-medium leading-relaxed">
              To report a copyright infringement, please prepare a formal written communication containing the following details:
            </p>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="p-8 bg-white rounded-[2rem] card-shadow border border-black/5">
                  <h3 className="font-bold text-lg mb-2 text-brand-secondary">{step.title}</h3>
                  <p className="text-sm text-brand-muted font-medium leading-relaxed">{step.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F3E5D8] p-10 rounded-[3rem] card-shadow border border-black/5 text-center">
             <h3 className="text-xl font-bold mb-4 tracking-tight">Submit Claim Notice</h3>
             <p className="text-brand-muted font-medium mb-8 leading-relaxed">
               Please send your completed notice to our Trust & Safety department for evaluation. Account holders found hosting infringing files will receive immediate warnings or permanent suspension.
             </p>
             <Link href="mailto:safety@nexora.co.ke" className="text-brand-primary font-bold uppercase tracking-widest text-xs hover:underline">Email safety@nexora.co.ke</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
