'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="h-20 md:h-24 bg-white/5 backdrop-blur-xl border-b border-white/10 fixed top-0 left-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 text-white">
          <Image src="/logo.png" alt="Nexora Chai" width={32} height={32} className="rounded-xl md:w-10 md:h-10" />
          <span className="font-bold text-lg md:text-xl tracking-tight">Nexora Chai</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-white/70">
          <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
          <Link href="/creators" className="hover:text-white transition-colors">Creators</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/login" className="text-sm font-bold text-white hover:text-brand-primary transition-colors">Login</Link>
          <Link href="/register" className="btn-primary px-6 py-3 shadow-xl shadow-brand-primary/10 bg-[#914D00] text-white">Claim My Page</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-brand-primary bg-brand-beige-light rounded-xl"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-black/5 p-6 space-y-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4 text-lg font-black text-brand-muted">
              <Link href="/explore" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">Explore</Link>
              <Link href="/creators" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">Creators</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">About</Link>
            </div>
            
            <hr className="border-black/5" />
            
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-4 rounded-2xl border border-black/10 font-black text-sm uppercase tracking-widest">Login</Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="w-full text-center py-4 rounded-2xl bg-brand-primary text-white font-black text-sm uppercase tracking-widest bg-[#914D00]">Claim My Page</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
