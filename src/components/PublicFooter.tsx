'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PublicFooter() {
    return (
        <footer className="border-t border-black/5 bg-white py-20 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-8">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Nexora Chai</span>
                    </div>
                    <p className="text-brand-muted font-medium max-w-sm mb-8 leading-relaxed">
                        The premium platform for African creators to receive support directly from their audience. Secure, fast, and built for your growth.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/terms" className="text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">Privacy</Link>
                    </div>
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-widest text-[10px] text-brand-muted mb-6">Product</h4>
                    <ul className="space-y-4 text-sm font-bold">
                        <li><Link href="/#explore" className="hover:text-brand-primary transition-colors">Explore</Link></li>
                        <li><Link href="/pricing" className="hover:text-brand-primary transition-colors">Pricing</Link></li>
                        <li><Link href="/about" className="hover:text-brand-primary transition-colors">About</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-widest text-[10px] text-brand-muted mb-6">Support</h4>
                    <ul className="space-y-4 text-sm font-bold">
                        <li><Link href="/help" className="hover:text-brand-primary transition-colors">Help Center</Link></li>
                        <li><Link href="/contact" className="hover:text-brand-primary transition-colors">Contact</Link></li>
                        <li><Link href="/fees" className="hover:text-brand-primary transition-colors">Fees</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/[0.03] text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted opacity-50">
                    © 2026 Nexora Chai. Premium Financial Trust for African Creators. Powered by Nexora Creative Solutions.
                </p>
            </div>
        </footer>
    );
}
