'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Settings, 
  Radio,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface DashboardSidebarProps {
  displayName: string;
  username: string;
  avatarUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ displayName, username, avatarUrl, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { label: 'Earnings', icon: Wallet, href: '/dashboard/earnings' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const SidebarContent = (
    <aside className={`
      w-64 bg-white border-r border-black/5 flex flex-col p-6 h-screen shrink-0
      ${isOpen ? 'relative' : 'sticky top-0'}
    `}>
      <div className="flex items-center justify-between mb-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-center overflow-hidden p-1 group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
          </div>
          <span className="text-[#1A1A1A] font-bold text-xl tracking-tight">Nexora Chai</span>
        </Link>
        {onClose && (
            <button onClick={onClose} className="lg:hidden text-brand-muted hover:text-black">
                <X size={20} />
            </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-10 p-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-beige">
              <Image src={avatarUrl || '/avatar-1.png'} alt="Creator" width={40} height={40} unoptimized />
          </div>
          <div className="overflow-hidden">
              <p className="font-bold text-sm tracking-tight truncate">{displayName}</p>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Premium Tier</p>
          </div>
      </div>

      <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                    key={item.label}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                        isActive 
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 bg-[#914D00] translate-x-1' 
                            : 'text-brand-muted hover:bg-black/[0.03] hover:text-foreground'
                    }`}
                >
                    <item.icon size={18} />
                    {item.label}
                </Link>
              );
          })}
      </nav>

      <Link 
        href={`/${username}`} 
        target="_blank"
        className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#914D00] shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-transform text-white"
      >
          <Radio size={16} /> Go Live
      </Link>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-[200]"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
