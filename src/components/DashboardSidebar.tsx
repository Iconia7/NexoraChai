'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Settings,
  Radio,
  X,
  LogOut,
  Users,
  ShoppingBag,
  Heart,
  MessageSquare,
  Sparkles,
  Building
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Supporters CRM', icon: Users, href: '/dashboard/crm' },
    { label: 'My Shop', icon: ShoppingBag, href: '/dashboard/products' },
    { label: 'Memberships', icon: Heart, href: '/dashboard/memberships' },
    { label: 'Gated Posts', icon: MessageSquare, href: '/dashboard/posts' },
    { label: 'Commissions', icon: Sparkles, href: '/dashboard/commissions' },
    { label: 'Organizations', icon: Building, href: '/dashboard/organizations' },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { label: 'Earnings', icon: Wallet, href: '/dashboard/earnings' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarContent = (
    <aside className={`
      w-64 bg-white border-r border-black/5 flex flex-col h-screen shrink-0 overflow-hidden
      ${isOpen ? 'relative' : 'sticky top-0'}
    `}>
      {/* 1. TOP SECTION - Fixed */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center group">
            <Image src="/logo.png" alt="Talent Jar Logo" width={180} height={60} className="object-contain h-16 w-auto group-hover:scale-105 transition-transform" />
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-brand-muted hover:text-black">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6 p-2 bg-brand-beige-light/50 rounded-2xl border border-black/[0.02]">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-beige shrink-0 border-2 border-white shadow-sm">
            <Image src={avatarUrl || '/avatar-1.png'} alt="Creator" width={40} height={40} unoptimized className="object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm tracking-tight truncate">{displayName}</p>
            <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Premium Tier</p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-6 pt-2 space-y-1 no-scrollbar">
        <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-4 ml-2 opacity-50">Menu</p>
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${isActive
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

      {/* 3. BOTTOM SECTION - Fixed */}
      <div className="p-6 pt-4 border-t border-black/[0.03] space-y-3">
        <Link
          href={`/${username}`}
          target="_blank"
          className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#914D00] shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-transform text-white"
        >
          <Radio size={16} /> Go Live
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
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
