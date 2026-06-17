'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Heart, Zap, Globe, Shield, Sparkles, Share2, Copy, Check, MessageSquare, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutModal from '@/components/CheckoutModal';
import ProductCheckoutModal from '@/components/ProductCheckoutModal';
import MembershipCheckoutModal from '@/components/MembershipCheckoutModal';
import CommissionCheckoutModal from '@/components/CommissionCheckoutModal';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import GoalProgressCard from '@/components/GoalProgressCard';
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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('support');
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const addToast = useToastStore((state) => state.addToast);

  // Products storefront state
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Memberships storefront state
  const [tiers, setTiers] = useState<any[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  // Commissions storefront state
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  // Posts storefront state
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const basePrice = 100;
  const finalAmount = customAmount ? Number(customAmount) : basePrice * multiplier;

  useEffect(() => {
    if (activeTab === 'products' && creator?.id && products.length === 0) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const res = await axios.get(`${BACKEND_URL}/api/products/public/${username}`);
          setProducts(res.data);
        } catch (err) {
          console.error('Failed to fetch public products', err);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [activeTab, creator?.id, username, products.length]);

  useEffect(() => {
    if (activeTab === 'memberships' && creator?.id && tiers.length === 0) {
      const fetchTiers = async () => {
        setLoadingTiers(true);
        try {
          const res = await axios.get(`${BACKEND_URL}/api/memberships/public/${username}`);
          setTiers(res.data);
        } catch (err) {
          console.error('Failed to fetch public membership tiers', err);
        } finally {
          setLoadingTiers(false);
        }
      };
      fetchTiers();
    }
  }, [activeTab, creator?.id, username, tiers.length]);

  useEffect(() => {
    if (activeTab === 'posts' && creator?.id && posts.length === 0) {
      const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await axios.get(`${BACKEND_URL}/api/posts/public/${username}`, { headers });
          setPosts(res.data);
        } catch (err) {
          console.error('Failed to fetch public posts', err);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchPosts();
    }
  }, [activeTab, creator?.id, username, posts.length]);

  useEffect(() => {
    if (activeTab === 'commissions' && creator?.id && services.length === 0) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const res = await axios.get(`${BACKEND_URL}/api/commissions/services/public/${username}`);
          setServices(res.data);
        } catch (err) {
          console.error('Failed to fetch public services', err);
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [activeTab, creator?.id, username, services.length]);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/${username}`);
        setCreator(res.data);

        // Fetch active support goal
        if (res.data.id) {
          try {
            const goalRes = await axios.get(`${BACKEND_URL}/api/goals/active/${res.data.id}`);
            setActiveGoal(goalRes.data);
          } catch (goalErr) {
            console.error('Failed to fetch active goal', goalErr);
          }
        }

        // Increment views
        axios.post(`${BACKEND_URL}/api/creators/${username}/views`).catch(() => { });
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F5] text-foreground font-sans animate-pulse">
      <PublicNavbar />
      <div className="relative h-[300px] md:h-[400px] w-full bg-gray-200" />
      <div className="max-w-xl mx-auto px-6 pb-32">
        <div className="relative -mt-24 flex flex-col items-center text-center mb-16">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white bg-gray-300 mb-6 shadow-xl animate-pulse" />
          <div className="h-8 w-48 bg-gray-300 rounded mb-4 animate-pulse" />
          <div className="h-4 w-24 bg-gray-300 rounded-full mb-6 animate-pulse" />
          <div className="h-4 w-64 bg-gray-300 rounded mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="bg-white p-6 md:p-12 rounded-[2.5rem] card-shadow border border-black/[0.02] h-[400px] animate-pulse" />
      </div>
      <PublicFooter />
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

  const settings = creator.pageSettings || {
    themeName: 'amber',
    primaryColor: '#914D00',
    accentColor: '#B36200',
    bannerUrl: null,
    showRecentSupporters: true,
    showTopSupporters: true,
    showGoals: true,
    showProducts: true,
    showMemberships: true,
    showCommissions: true,
    showPosts: true,
    pinnedMessage: null
  };

  const isDark = settings.themeName === 'dark';
  const isLight = settings.themeName === 'light';
  const isCustom = settings.themeName === 'custom';

  let bgClass = 'bg-[#FAF8F5]'; // Default amber-beige
  let textClass = 'text-gray-900';
  let cardClass = 'bg-white text-gray-900 border-black/[0.02]';
  let primaryColorHex = '#914D00';
  let accentColorHex = '#B36200';

  if (isDark) {
    bgClass = 'bg-[#0E0E10]';
    textClass = 'text-white';
    cardClass = 'bg-[#18181B] text-white border-white/[0.05]';
    primaryColorHex = '#FFFFFF';
    accentColorHex = '#A1A1AA';
  } else if (isLight) {
    bgClass = 'bg-gray-50';
    textClass = 'text-gray-900';
    cardClass = 'bg-white text-gray-900 border-gray-100';
    primaryColorHex = '#18181B';
    accentColorHex = '#4B5563';
  } else if (isCustom) {
    bgClass = 'bg-[#FAF8F5]';
    textClass = 'text-gray-900';
    cardClass = 'bg-white text-gray-900 border-black/[0.02]';
    primaryColorHex = settings.primaryColor || '#914D00';
    accentColorHex = settings.accentColor || '#B36200';
  }

  const tabs = [
    { id: 'support', label: 'Support', icon: Coffee },
    ...(settings.showProducts ? [{ id: 'products', label: 'Shop', icon: ShoppingBag }] : []),
    ...(settings.showMemberships ? [{ id: 'memberships', label: 'Membership', icon: Heart }] : []),
    ...(settings.showCommissions ? [{ id: 'commissions', label: 'Commissions', icon: Sparkles }] : []),
    ...(settings.showPosts ? [{ id: 'posts', label: 'Posts', icon: MessageSquare }] : []),
  ];

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-sans transition-colors duration-300 selection:bg-brand-primary/10`}>
      <PublicNavbar />

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        creator={creator}
        amount={finalAmount}
        message={message}
        fanName={fanName}
        source={trafficSource}
        goalId={settings.showGoals && activeGoal ? activeGoal.id : undefined}
        paymentType={settings.showGoals && activeGoal ? 'GOAL' : 'TIP'}
      />

      {selectedProduct && (
        <ProductCheckoutModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          creator={creator}
          product={selectedProduct}
          primaryColorHex={primaryColorHex}
        />
      )}

      {selectedTier && (
        <MembershipCheckoutModal
          isOpen={isMembershipModalOpen}
          onClose={() => {
            setIsMembershipModalOpen(false);
            setSelectedTier(null);
          }}
          creator={creator}
          tier={selectedTier}
          primaryColorHex={primaryColorHex}
        />
      )}

      {selectedService && (
        <CommissionCheckoutModal
          isOpen={isCommissionModalOpen}
          onClose={() => {
            setIsCommissionModalOpen(false);
            setSelectedService(null);
          }}
          creator={creator}
          service={selectedService}
          primaryColorHex={primaryColorHex}
        />
      )}

      <main className="pb-16 md:pb-32">
        {/* Hero Banner */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-gradient-to-r from-[#914D00]/10 to-[#B36200]/5">
          <Image
            src={settings.bannerUrl || "/profile-banner.png"}
            alt="Profile Banner"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent, ${isDark ? '#0E0E10' : isLight ? '#F9FAFB' : '#FAF8F5'} 92%)`
            }}
          />
        </div>

        <div className="max-w-xl mx-auto px-4 sm:px-6">
          {/* Profile Header */}
          <div className="relative -mt-24 flex flex-col items-center text-center mb-10">
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

            <div className="flex items-center gap-2 mb-2 justify-center flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center">{creator.displayName}</h1>
              <Sparkles size={18} style={{ color: primaryColorHex }} />
            </div>

            <div className="flex items-center gap-3 justify-center mb-6">
              <p
                className="font-bold text-sm tracking-wider px-4 py-1.5 rounded-full uppercase"
                style={{
                  backgroundColor: `${primaryColorHex}15`,
                  color: primaryColorHex
                }}
              >
                @{creator.username}
              </p>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white dark:bg-zinc-800 shadow-md hover:scale-105 transition-all text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white border border-black/5 dark:border-white/5 flex items-center justify-center"
                title="Share Profile"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
              </button>
            </div>

            <div className="max-w-md">
              <p className="text-brand-muted font-bold text-xs uppercase tracking-widest mb-2 md:mb-3">{creator.category || 'Creator'}</p>
              <p className="text-brand-muted font-medium text-sm sm:text-base md:text-lg leading-relaxed">
                {creator.bio || `Supporting ${creator.displayName}'s creative journey on Nexora Chai.`}
              </p>

              {settings.pinnedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md border border-white/20 dark:border-white/5 text-sm font-medium leading-relaxed italic text-center relative"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider shadow">
                    Pinned Message
                  </div>
                  "{settings.pinnedMessage}"
                </motion.div>
              )}

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
                  <div className="flex items-center justify-center gap-4 mt-8">
                    {socials.twitter && (
                      <a
                        href={`https://x.com/${socials.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-black/5 dark:border-white/5 flex items-center justify-center text-brand-muted hover:text-blue-400 hover:scale-110 hover:shadow-lg transition-all"
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
                        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-black/5 dark:border-white/5 flex items-center justify-center text-brand-muted hover:text-pink-500 hover:scale-110 hover:shadow-lg transition-all"
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
                        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-black/5 dark:border-white/5 flex items-center justify-center text-brand-muted hover:text-red-500 hover:scale-110 hover:shadow-lg transition-all"
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
                        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-black/5 dark:border-white/5 flex items-center justify-center text-brand-muted hover:text-brand-primary hover:scale-110 hover:shadow-lg transition-all"
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

          {/* Animated Tab Bar */}
          <div className="flex border-b border-black/[0.05] dark:border-white/[0.05] mb-8 overflow-x-auto scrollbar-none py-2 gap-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative shrink-0 px-5 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-2 select-none"
                  style={{
                    color: isActive ? primaryColorHex : 'inherit',
                    opacity: isActive ? 1 : 0.6
                  }}
                >
                  <TabIcon size={16} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabOutline"
                      className="absolute inset-0 rounded-xl border border-black/10 dark:border-white/10 animate-fade-in"
                      style={{
                        backgroundColor: `${primaryColorHex}08`
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Support Goal Progress Card */}
                  {settings.showGoals && activeGoal && (
                    <GoalProgressCard goal={activeGoal} />
                  )}

                  {/* Support Card */}
                  <div className={`${cardClass} p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] card-shadow border`}>
                    <div className="flex flex-col items-center text-center mb-10">
                      <div
                        className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 animate-pulse"
                        style={{
                          backgroundColor: `${primaryColorHex}15`,
                          color: primaryColorHex
                        }}
                      >
                        <Coffee size={32} />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight mb-2">Buy {creator.displayName} a Chai</h2>
                      <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Support with M-Pesa or Card</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                      {[1, 3, 5, 10].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setMultiplier(m);
                            setCustomAmount('');
                          }}
                          className="flex flex-col items-center justify-center py-5 rounded-[1.5rem] border-2 transition-all group relative overflow-hidden"
                          style={{
                            borderColor: !customAmount && multiplier === m ? primaryColorHex : 'rgba(0,0,0,0.05)',
                            backgroundColor: !customAmount && multiplier === m ? `${primaryColorHex}08` : 'transparent'
                          }}
                        >
                          <span
                            className="text-sm font-bold uppercase tracking-widest group-hover:scale-110 transition-transform"
                            style={{ color: !customAmount && multiplier === m ? primaryColorHex : 'inherit' }}
                          >
                            x{m}
                          </span>
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
                          className="input-base text-center py-5 text-sm font-bold bg-[#F9FAFB] dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 border border-black/5 dark:border-white/5 rounded-2xl w-full"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-60 font-bold text-xs">KES</div>
                      </div>

                      <input
                        type="text"
                        placeholder="Your Name (optional)"
                        value={fanName}
                        onChange={(e) => setFanName(e.target.value)}
                        className="input-base text-center py-5 text-sm font-bold bg-[#F9FAFB] dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 border border-black/5 dark:border-white/5 rounded-2xl w-full"
                      />

                      <textarea
                        placeholder="Say something nice..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="input-base text-center py-5 text-sm font-medium bg-[#F9FAFB] dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 border border-black/5 dark:border-white/5 rounded-2xl w-full min-h-[120px] resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSupportClick}
                      className="w-full py-6 text-lg font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group rounded-3xl"
                      style={{
                        backgroundColor: primaryColorHex,
                        color: isDark ? '#000000' : '#FFFFFF',
                        boxShadow: `0 20px 40px ${primaryColorHex}25`
                      }}
                    >
                      Send KES {finalAmount.toLocaleString()} <Heart size={20} className="group-hover:scale-125 transition-transform fill-current" />
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-all dark:invert dark:brightness-200">
                      <Image src="/mpesa-logo.png" alt="M-Pesa" width={60} height={30} className="object-contain h-6 w-auto" />
                      <Image src="/visa-mastercard.png" alt="Card" width={80} height={30} className="object-contain h-6 w-auto" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-left"
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold tracking-tight mb-2">Digital Storefront</h3>
                    <p className="opacity-60 text-sm font-medium">Browse guides, presets, and digital items curated by {creator.displayName}.</p>
                  </div>

                  {loadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[...Array(2)].map((_, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden animate-pulse h-[350px]" />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center max-w-md mx-auto">
                      <div
                        className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
                        style={{
                          backgroundColor: `${primaryColorHex}10`,
                          color: primaryColorHex
                        }}
                      >
                        <ShoppingBag size={36} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Shop is Empty</h3>
                      <p className="opacity-60 mb-6 font-medium">This creator hasn't listed any digital products yet. Stay tuned!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={`rounded-[2.5rem] border border-black/[0.04] dark:border-white/[0.05] overflow-hidden flex flex-col justify-between p-6 ${cardClass} shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 min-h-[380px]`}
                        >
                          <div>
                            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-brand-beige-light/50 dark:bg-zinc-800 flex items-center justify-center mb-4 border border-black/[0.02] dark:border-white/[0.02]">
                              {product.coverImageUrl ? (
                                <img
                                  src={product.coverImageUrl}
                                  alt={product.title}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <ShoppingBag size={48} className="text-brand-muted/40" />
                              )}
                              {product.category && (
                                <span className="absolute top-3 left-3 bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                  {product.category}
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-lg leading-tight mb-2 tracking-tight line-clamp-1">{product.title}</h4>
                            <p className="text-xs font-medium opacity-60 line-clamp-2 leading-relaxed mb-4">{product.description || 'No description provided.'}</p>
                          </div>

                          <div className="flex items-center justify-between mt-4 border-t border-black/[0.04] dark:border-white/[0.05] pt-4">
                            <div>
                              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Price</p>
                              <p className="font-bold text-base" style={{ color: primaryColorHex }}>
                                {product.isFree ? 'FREE' : `${product.currency} ${Number(product.price).toLocaleString()}`}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-white"
                              style={{ backgroundColor: primaryColorHex }}
                            >
                              {product.isFree ? 'Get Free' : 'Buy Now'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'memberships' && (
                <motion.div
                  key="memberships"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-left"
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold tracking-tight mb-2">Membership Tiers</h3>
                    <p className="opacity-60 text-sm font-medium">Join {creator.displayName}'s inner circle to support their work monthly and unlock exclusive perks.</p>
                  </div>

                  {loadingTiers ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[...Array(2)].map((_, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden animate-pulse h-[300px]" />
                      ))}
                    </div>
                  ) : tiers.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center max-w-md mx-auto">
                      <div
                        className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
                        style={{
                          backgroundColor: `${primaryColorHex}10`,
                          color: primaryColorHex
                        }}
                      >
                        <Heart size={36} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">No Tiers Available</h3>
                      <p className="opacity-60 mb-6 font-medium">This creator hasn't listed any membership tiers yet. Stay tuned!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {tiers.map((tier) => {
                        const benefitsList = (() => {
                          if (!tier.benefits) return [];
                          try {
                            const parsed = JSON.parse(tier.benefits);
                            if (Array.isArray(parsed)) return parsed;
                          } catch (e) { }
                          return tier.benefits.split(/[,\n]+/).map((b: string) => b.trim()).filter(Boolean);
                        })();

                        return (
                          <div
                            key={tier.id}
                            className={`rounded-[2.5rem] border border-black/[0.04] dark:border-white/[0.05] overflow-hidden flex flex-col justify-between p-6 ${cardClass} shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 min-h-[320px]`}
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0" style={{ color: primaryColorHex, backgroundColor: `${primaryColorHex}15` }}>
                                  <Heart size={20} className="fill-current" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg leading-tight tracking-tight line-clamp-1">{tier.name}</h4>
                                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">{tier.billingInterval}</span>
                                </div>
                              </div>

                              <p className="text-xs font-medium opacity-65 leading-relaxed mb-6 line-clamp-3">{tier.description || 'No description provided.'}</p>

                              {benefitsList.length > 0 && (
                                <div className="space-y-2 mb-6">
                                  <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">Included Perks:</p>
                                  <ul className="space-y-1.5">
                                    {benefitsList.map((benefit: string, idx: number) => (
                                      <li key={idx} className="text-xs font-semibold flex items-start gap-2">
                                        <span style={{ color: primaryColorHex }}>•</span>
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t border-black/[0.04] dark:border-white/[0.05] pt-4">
                              <div>
                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Price</p>
                                <p className="font-bold text-base" style={{ color: primaryColorHex }}>
                                  {tier.currency} {Number(tier.price).toLocaleString()}
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedTier(tier);
                                  setIsMembershipModalOpen(true);
                                }}
                                className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-white"
                                style={{ backgroundColor: primaryColorHex }}
                              >
                                Join Tier
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'commissions' && (
                <motion.div
                  key="commissions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-left font-sans"
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold tracking-tight mb-2">Commissions & Services</h3>
                    <p className="opacity-60 text-sm font-medium">Hire {creator.displayName} for custom greetings, reviews, calls, or digital services.</p>
                  </div>

                  {loadingServices ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[...Array(2)].map((_, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden animate-pulse h-64" />
                      ))}
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center max-w-md mx-auto">
                      <div
                        className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
                        style={{
                          backgroundColor: `${primaryColorHex}10`,
                          color: primaryColorHex
                        }}
                      >
                        <Sparkles size={36} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Commissions Closed</h3>
                      <p className="opacity-60 mb-6 font-medium">This creator isn't accepting custom bookings at the moment. Check back later!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className={`rounded-[2.5rem] border border-black/[0.04] dark:border-white/[0.05] p-6 md:p-8 ${cardClass} shadow-md flex flex-col justify-between min-h-[280px] hover:shadow-xl hover:scale-[1.01] transition-all duration-300`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0" style={{ color: primaryColorHex, backgroundColor: `${primaryColorHex}15` }}>
                                <Sparkles size={20} className="fill-current" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 bg-zinc-50 border border-zinc-150 rounded-full">
                                {service.deliveryDays} Day{service.deliveryDays !== 1 && 's'} Delivery
                              </span>
                            </div>

                            <h4 className="font-extrabold text-lg md:text-xl tracking-tight mb-2 truncate" title={service.title}>
                              {service.title}
                            </h4>

                            <p className="text-xs font-medium opacity-65 leading-relaxed mb-6 line-clamp-3">
                              {service.description || 'No description provided.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.05] pt-4 mt-4">
                            <div>
                              <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">Pricing</p>
                              <p className="font-bold text-base" style={{ color: primaryColorHex }}>
                                {service.currency} {Number(service.price).toLocaleString()}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedService(service);
                                setIsCommissionModalOpen(true);
                              }}
                              className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white hover:scale-105 active:scale-95 transition-all"
                              style={{ backgroundColor: primaryColorHex }}
                            >
                              Request Booking
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-16"
                >
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
                      style={{
                        backgroundColor: `${primaryColorHex}10`,
                        color: primaryColorHex
                      }}
                    >
                      <MessageSquare size={36} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Exclusive Posts</h3>
                    <p className="opacity-60 mb-6 font-medium">Stay updated with private updates, drafts, and behind-the-scenes content.</p>
                    <div className="text-sm font-bold uppercase tracking-widest px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full opacity-50">
                      No exclusive posts yet
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-6">Secured by Nexora Cloud</p>
            <div className="flex items-center justify-center gap-4 text-brand-muted">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-full text-[9px] font-bold uppercase tracking-widest card-shadow border border-black/5 dark:border-white/5">
                <Globe size={12} className="text-blue-500" /> Global Payments
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-full text-[9px] font-bold uppercase tracking-widest card-shadow border border-black/5 dark:border-white/5">
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
