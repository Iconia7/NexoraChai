'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function RefundPolicyPage() {
  const policies = [
    {
      title: 'Digital Products & Downloads',
      content: 'Due to the instantaneous nature of digital file access, orders for digital downloads are generally non-refundable once the secure download link (R2 expiring URL) has been generated or accessed. If a file is corrupted, mismatched, or fails to deliver, supporters can request assistance or log a download dispute.'
    },
    {
      title: 'Membership Subscription Tiers',
      content: 'Memberships can be cancelled at any time by the supporter. Monthly recurring subscriptions remain active until the end of the current billing cycle. Refunds for past membership periods are at the sole discretion of the creator, unless the creator failed to provide the promised benefits.'
    },
    {
      title: 'Commissions & Bookings',
      content: 'Supporters can request a full refund if the commission service has not yet been accepted by the creator. If the order is cancelled by the creator or exceeds the agreed delivery timeframe without deliverable file submission, the payment will be reversed back to the supporter.'
    },
    {
      title: 'Dispute & Resolution Workflow',
      content: 'If a supporter disputes an order (e.g. non-delivery of service or fraudulent charge), Talent Jar freezes the specific payout allocation. The supporter and creator will be requested to submit delivery proofs. Safe resolutions are handled directly by the support team.'
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
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Refund & Dispute <span className="text-brand-primary">Policy.</span></h1>
          <p className="text-brand-muted font-bold mb-16 uppercase tracking-widest text-xs">Last Updated: June 2026</p>

          <p className="text-xl text-brand-muted font-medium mb-12 leading-relaxed">
            Talent Jar aims to maintain trust and transparency between creators and supporters. This policy structures the conditions for refund claims and dispute resolutions.
          </p>

          <div className="space-y-12 mb-16">
            {policies.map((p, i) => (
              <div key={i}>
                <h2 className="text-2xl font-bold mb-4 tracking-tight text-brand-primary">{p.title}</h2>
                <p className="text-lg text-brand-muted font-medium leading-relaxed">
                  {p.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-white rounded-[3rem] card-shadow border border-black/[0.02] text-center">
             <h3 className="text-xl font-bold mb-4 tracking-tight">Need Refund Support?</h3>
             <p className="text-brand-muted font-medium mb-8">For direct assistance regarding a disputed transaction, file download issue, or billing refund request:</p>
             <Link href="mailto:support@nexoracreatives.co.ke" className="text-brand-primary font-bold uppercase tracking-widest text-xs hover:underline">Contact Support Team</Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
