'use client';

import { useToastStore } from '@/lib/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white rounded-2xl p-4 card-shadow border border-black/5 flex items-center gap-4 min-w-[320px] max-w-md"
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${toast.type === 'success' ? 'bg-brand-secondary/10 text-brand-secondary' : ''}
              ${toast.type === 'error' ? 'bg-red-500/10 text-red-500' : ''}
              ${toast.type === 'info' ? 'bg-brand-primary/10 text-brand-primary' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle2 size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>

            <div className="flex-1 mr-4">
              <p className="text-sm font-bold text-foreground leading-snug">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="text-brand-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
