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
  const [trafficSource, setTrafficSource] = useState('Direct Link');
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

    // Detect traffic source
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const querySource = urlParams.get('source') || urlParams.get('ref');
      const referrer = document.referrer ? document.referrer.toLowerCase() : '';

      let source = 'Direct Link';

      if (querySource) {
        const qs = querySource.toLowerCase();
        if (qs === 'twitter' || qs === 'x') source = 'Twitter / X';
        else if (qs === 'instagram') source = 'Instagram';
        else if (qs === 'youtube') source = 'YouTube';
        else if (qs === 'facebook') source = 'Facebook';
        else source = querySource;
      } else if (referrer) {
        if (referrer.includes('t.co') || referrer.includes('twitter.com') || referrer.includes('x.com')) {
          source = 'Twitter / X';
        } else if (referrer.includes('instagram.com')) {
          source = 'Instagram';
        } else if (referrer.includes('youtube.com')) {
          source = 'YouTube';
        } else if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
          source = 'Facebook';
        }
      }
      setTrafficSource(source);
    }
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
      <p className="font-bold uppercase tracking-widest text-brand-muted text-xs">Loading Creator Profile...</p>
    </div>
  );

  if (!creator) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige-light px-6 text-center">
       <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} />
       </div>
       <h1 className="text-3xl font-bold mb-2">Creator not found</h1>
       <p className="text-brand-muted font-medium mb-8">The page you're looking for doesn't exist or has been moved.</p>
       <Link href="/" className="btn-primary px-8 py-4 bg-[#914D00] text-sm uppercase tracking-widest font-bold">Go Home</Link>
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
        source={trafficSource}
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
                <h1 className="text-4xl font-bold tracking-tight">{creator.displayName}</h1>
                <Sparkles size={20} className="text-brand-primary" />
              </div>
              
              <p className="text-brand-primary font-bold text-sm mb-6 tracking-wider bg-brand-primary/5 px-4 py-1.5 rounded-full uppercase">@{creator.username}</p>
              
              <div className="max-w-md">
                 <p className="text-brand-muted font-bold text-xs uppercase tracking-widest mb-3">{creator.category || 'Creator'}</p>
                 <p className="text-brand-muted font-medium text-lg leading-relaxed">
                    {creator.bio || `Supporting ${creator.displayName}'s creative journey on Nexora Chai.`}
                 </p>
                 
                 {/* Clickable Social Media Links */}
                 {(() => {
                    let socials: any = {};
                    if (creator?.socialLinks) {
                      try {
                        socials = JSON.parse(creator.socialLinks);
                      } catch (e) {
                        console.error('Failed to parse socials JSON', e);
                      }
                    }
                    if (!Object.keys(socials).some(key => socials[key])) return null;
                    return (
                      <div className="flex items-center justify-center gap-4 mt-6">
                        {socials.twitter && (
                          <a
                            href={`https://x.com/${socials.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-brand-muted hover:text-blue-400 hover:scale-110 hover:shadow-lg transition-all"
                            title="Twitter / X"
                          >
                            <TwitterIcon size={18} />
                          </a>
                        )}
                        {socials.instagram && (
                          <a
                            href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-brand-muted hover:text-pink-500 hover:scale-110 hover:shadow-lg transition-all"
                            title="Instagram"
                          >
                            <InstagramIcon size={18} />
                          </a>
                        )}
                        {socials.youtube && (
                          <a
                            href={socials.youtube.startsWith('http') ? socials.youtube : `https://youtube.com/${socials.youtube.startsWith('@') ? socials.youtube : '@' + socials.youtube}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-brand-muted hover:text-red-500 hover:scale-110 hover:shadow-lg transition-all"
                            title="YouTube"
                          >
                            <YoutubeIcon size={18} />
                          </a>
                        )}
                        {socials.website && (
                          <a
                            href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-brand-muted hover:text-brand-primary hover:scale-110 hover:shadow-lg transition-all"
                            title="Website"
                          >
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
                    );
                 })()}
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
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Buy {creator.displayName} a Chai</h2>
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
                        <span className="text-sm font-bold uppercase tracking-widest group-hover:scale-110 transition-transform">x{m}</span>
                        <span className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">KES {m * basePrice}</span>
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
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted font-bold text-xs">KES</div>
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
                className="w-full btn-primary py-6 text-lg font-bold bg-[#914D00] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                Send KES {finalAmount.toLocaleString()} <Heart size={20} className="group-hover:scale-125 transition-transform fill-white" />
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-all">
                <Image src="/mpesa-logo.png" alt="M-Pesa" width={60} height={30} className="object-contain h-6 w-auto" />
                <Image src="/visa-mastercard.png" alt="Card" width={80} height={30} className="object-contain h-6 w-auto" />
              </div>
           </motion.div>

           <div className="mt-12 text-center">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-6">Secured by Nexora Cloud</p>
              <div className="flex items-center justify-center gap-4 text-brand-muted">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[9px] font-bold uppercase tracking-widest card-shadow">
                    <Globe size={12} className="text-blue-500" /> Global Payments
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[9px] font-bold uppercase tracking-widest card-shadow">
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

function TwitterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
      <polygon points="10 15 15 12 10 9" />
    </svg>
  );
}
