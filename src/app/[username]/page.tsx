'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Heart, Zap, Globe, Shield, Sparkles } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutModal from '@/components/CheckoutModal';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function CreatorPage() {
  const { username } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [fanName, setFanName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const basePrice = 100;
  const finalAmount = customAmount ? Number(customAmount) : basePrice * multiplier;

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/${username}`);
        setCreator(res.data);
        
        // Increment views
        axios.post(`${BACKEND_URL}/api/creators/${username}/views`).catch(() => {});
      } catch (err) {
        console.error('Creator not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [username]);

  const handleSupportClick = () => {
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige-light">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-brand-primary mb-4"
      >
        <Coffee size={40} />
      </motion.div>
      <p className="font-black uppercase tracking-widest text-brand-muted text-xs">Loading Creator Profile...</p>
    </div>
  );

  if (!creator) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige-light px-6 text-center">
       <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} />
       </div>
       <h1 className="text-3xl font-black mb-2">Creator not found</h1>
       <p className="text-brand-muted font-medium mb-8">The page you're looking for doesn't exist or has been moved.</p>
       <Link href="/" className="btn-primary px-8 py-4 bg-[#914D00] text-sm uppercase tracking-widest font-black">Go Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10">
      <PublicNavbar />

      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        creator={creator}
        amount={finalAmount}
        message={message}
        fanName={fanName}
      />

      <main className="pb-32">
        {/* Hero Banner */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
          <Image 
            src="/profile-banner.png" 
            alt="Profile Banner" 
            fill 
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-beige-light/80" />
        </div>

        <div className="max-w-xl mx-auto px-6">
           {/* Profile Header */}
           <div className="relative -mt-24 flex flex-col items-center text-center mb-16">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] md:border-[8px] border-white bg-white shadow-2xl overflow-hidden relative mb-4 md:mb-6"
              >
                 <Image 
                    src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                    alt={creator.displayName}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 128px, 176px"
                    className="object-cover"
                 />
              </motion.div>
              
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-black tracking-tight">{creator.displayName}</h1>
                <Sparkles size={20} className="text-brand-primary" />
              </div>
              
              <p className="text-brand-primary font-black text-sm mb-6 tracking-wider bg-brand-primary/5 px-4 py-1.5 rounded-full uppercase">@{creator.username}</p>
              
              <div className="max-w-md">
                 <p className="text-brand-muted font-bold text-xs uppercase tracking-widest mb-3">{creator.category || 'Creator'}</p>
                 <p className="text-brand-muted font-medium text-lg leading-relaxed">
                    {creator.bio || `Supporting ${creator.displayName}'s creative journey on Nexora Chai.`}
                 </p>
              </div>
           </div>

           {/* Support Card */}
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] card-shadow border border-black/[0.02]"
           >
              <div className="flex flex-col items-center text-center mb-10">
                 <div className="w-16 h-16 bg-brand-beige-light rounded-[1.5rem] flex items-center justify-center text-brand-primary mb-6">
                    <Coffee size={32} />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight mb-2">Buy {creator.displayName} a Chai</h2>
                 <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Support with M-Pesa or Card</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                 {[1, 3, 5, 10].map((m) => (
                    <button
                        key={m}
                        onClick={() => {
                            setMultiplier(m);
                            setCustomAmount('');
                        }}
                        className={`flex flex-col items-center justify-center py-5 rounded-[1.5rem] border-2 transition-all group ${
                            !customAmount && multiplier === m 
                                ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-lg shadow-brand-primary/10' 
                                : 'border-black/[0.05] hover:border-black/10'
                        }`}
                    >
                        <span className="text-sm font-black uppercase tracking-widest group-hover:scale-110 transition-transform">x{m}</span>
                        <span className="text-[9px] font-black opacity-60 uppercase tracking-tighter">KES {m * basePrice}</span>
                    </button>
                 ))}
              </div>

              <div className="space-y-4 mb-10">
                 <div className="relative">
                    <input 
                        type="number"
                        placeholder="Custom Amount (KES)"
                        value={customAmount}
                        onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setMultiplier(0);
                        }}
                        className="input-base text-center py-5 text-sm font-bold bg-[#F9FAFB] focus:bg-white"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted font-black text-xs">KES</div>
                 </div>
                 
                 <input 
                    type="text"
                    placeholder="Your Name (optional)"
                    value={fanName}
                    onChange={(e) => setFanName(e.target.value)}
                    className="input-base text-center py-5 text-sm font-bold bg-[#F9FAFB] focus:bg-white"
                 />
                 
                 <textarea 
                    placeholder="Say something nice..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-base text-center py-5 text-sm font-medium bg-[#F9FAFB] focus:bg-white min-h-[120px] resize-none"
                 />
              </div>

              <button 
                onClick={handleSupportClick}
                className="w-full btn-primary py-6 text-lg font-black bg-[#914D00] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                Send KES {finalAmount.toLocaleString()} <Heart size={20} className="group-hover:scale-125 transition-transform fill-white" />
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-all">
                <Image src="/mpesa-logo.png" alt="M-Pesa" width={60} height={30} className="object-contain h-6 w-auto" />
                <Image src="/visa-mastercard.png" alt="Card" width={80} height={30} className="object-contain h-6 w-auto" />
              </div>
           </motion.div>

           <div className="mt-12 text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-6">Secured by Nexora Cloud</p>
              <div className="flex items-center justify-center gap-4 text-brand-muted">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[9px] font-black uppercase tracking-widest card-shadow">
                    <Globe size={12} className="text-blue-500" /> Global Payments
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[9px] font-black uppercase tracking-widest card-shadow">
                    <Shield size={12} className="text-green-500" /> SSL Encrypted
                 </div>
              </div>
           </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
