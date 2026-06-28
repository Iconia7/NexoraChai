'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PublicFooter() {
    return (
        <footer className="border-t border-black/5 bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                <div className="col-span-2">
                    <div className="flex items-center mb-5 md:mb-8">
                        <Image src="/logo.png" alt="Talent Jar Logo" width={100} height={32} className="object-contain h-8 w-auto" />
                    </div>
                    <p className="text-brand-muted font-medium max-w-sm mb-5 md:mb-8 leading-relaxed text-sm">
                        The go-to monetization platform for African creators. Sell digital products, run memberships, manage commissions, and accept secure payments.
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <Link href="/terms" className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">Privacy</Link>
                        <Link href="/aup" className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">AUP</Link>
                        <Link href="/refund-policy" className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">Refunds</Link>
                        <Link href="/takedown" className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">Takedown</Link>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold uppercase tracking-widest text-[10px] text-brand-muted mb-4 md:mb-6">Product</h4>
                    <ul className="space-y-3 md:space-y-4 text-sm font-bold">
                        <li><Link href="/explore" className="hover:text-brand-primary transition-colors">Explore</Link></li>
                        <li><Link href="/pricing" className="hover:text-brand-primary transition-colors">Pricing</Link></li>
                        <li><Link href="/about" className="hover:text-brand-primary transition-colors">About</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold uppercase tracking-widest text-[10px] text-brand-muted mb-4 md:mb-6">Support</h4>
                    <ul className="space-y-3 md:space-y-4 text-sm font-bold">
                        <li><Link href="/help" className="hover:text-brand-primary transition-colors">Help Center</Link></li>
                        <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Contact</Link></li>
                        <li><Link href="/fees" className="hover:text-brand-primary transition-colors">Fees</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-10 md:mt-20 pt-6 md:pt-8 border-t border-black/[0.03] text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted opacity-50">
                    © 2026 Talent Jar. Built for African Creators. Powered by Nexora Creative Solutions.
                </p>
            </div>
        </footer>
    );
}
