'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MobileDashboardNavProps {
  onOpenSidebar: () => void;
}

export default function MobileDashboardNav({ onOpenSidebar }: MobileDashboardNavProps) {
  return (
    <div className="lg:hidden h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 sticky top-0 z-[80] backdrop-blur-md bg-white/90">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Nexora Chai" width={28} height={28} className="rounded-lg" />
        <span className="font-bold text-sm tracking-tight">Nexora Chai</span>
      </Link>

      <button 
        onClick={onOpenSidebar}
        className="w-10 h-10 flex items-center justify-center text-brand-primary bg-brand-beige-light rounded-xl"
      >
        <Menu size={20} />
      </button>
    </div>
  );
}
