'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText, Download, Calendar, ArrowLeft, Heart, Sparkles, Coffee, Shield } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PostUnlockModal from '@/components/PostUnlockModal';
import CheckoutModal from '@/components/CheckoutModal';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function PostDetailPage() {
  const { username, slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [creator, setCreator] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Modals state
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  // Grab token from query params (guest access verification)
  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const fetchPostAndCreator = async () => {
    try {
      // 1. Fetch Creator info for page settings/theme
      const creatorRes = await axios.get(`${BACKEND_URL}/api/creators/${username}`);
      setCreator(creatorRes.data);

      // 2. Fetch Post Details
      const userToken = localStorage.getItem('token');
      const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};
      
      const queryToken = searchParams.get('token') || token;
      const url = queryToken 
        ? `${BACKEND_URL}/api/posts/public/${username}/${slug}?token=${queryToken}`
        : `${BACKEND_URL}/api/posts/public/${username}/${slug}`;
        
      const postRes = await axios.get(url, { headers });
      setPost(postRes.data);
    } catch (err: any) {
      console.error('Failed to load post details', err);
      addToast(err.response?.data?.error || 'Post not found or inaccessible', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndCreator();
  }, [username, slug, token]);

  const handleUnlockSuccess = (refToken: string) => {
    setIsUnlockModalOpen(false);
    setToken(refToken);
    // Add reference token to query string without page reload
    router.replace(`/${username}/posts/${slug}?token=${refToken}`);
    fetchPostAndCreator();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F5] text-foreground font-sans animate-pulse">
      <PublicNavbar />
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="h-6 w-24 bg-gray-200 rounded mb-8" />
        <div className="h-10 w-3/4 bg-gray-300 rounded mb-4" />
        <div className="h-4 w-40 bg-gray-200 rounded mb-12" />
        <div className="h-40 w-full bg-gray-200 rounded-3xl mb-6" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
      </div>
      <PublicFooter />
    </div>
  );

  if (!creator || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige-light px-6 text-center">
       <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} />
       </div>
       <h1 className="text-3xl font-bold mb-2">Post not found</h1>
       <p className="text-brand-muted font-medium mb-8">This post doesn't exist, is a draft, or the creator has removed it.</p>
       <Link href={`/${username}`} className="btn-primary px-8 py-4 bg-[#914D00] text-sm uppercase tracking-widest font-bold text-white rounded-xl">Go Back</Link>
    </div>
  );

  const settings = creator.pageSettings || {
    themeName: 'amber',
    primaryColor: '#914D00',
    accentColor: '#B36200',
  };

  const isDark = settings.themeName === 'dark';
  const isLight = settings.themeName === 'light';
  const isCustom = settings.themeName === 'custom';

  let bgClass = 'bg-[#FAF8F5]';
  let textClass = 'text-gray-900';
  let cardClass = 'bg-white text-gray-900 border-black/[0.02] shadow-xl';
  let primaryColorHex = '#914D00';
  let accentColorHex = '#B36200';

  if (isDark) {
    bgClass = 'bg-[#0E0E10]';
    textClass = 'text-white';
    cardClass = 'bg-[#18181B] text-white border-white/[0.05] shadow-2xl';
    primaryColorHex = '#FFFFFF';
    accentColorHex = '#A1A1AA';
  } else if (isLight) {
    bgClass = 'bg-gray-50';
    textClass = 'text-gray-900';
    cardClass = 'bg-white text-gray-900 border-gray-100 shadow-md';
    primaryColorHex = '#18181B';
    accentColorHex = '#4B5563';
  } else if (isCustom) {
    bgClass = 'bg-[#FAF8F5]'; 
    textClass = 'text-gray-900';
    cardClass = 'bg-white text-gray-900 border-black/[0.02] shadow-xl';
    primaryColorHex = settings.primaryColor || '#914D00';
    accentColorHex = settings.accentColor || '#B36200';
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-sans transition-colors duration-300`}>
      <PublicNavbar />

      {/* PostUnlockModal for Premium Unlock visibility */}
      <PostUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        creator={creator}
        post={{
          id: post.id,
          title: post.title,
          unlockPrice: Number(post.unlockPrice),
          slug: post.slug
        }}
        primaryColorHex={primaryColorHex}
        onSuccess={handleUnlockSuccess}
      />

      {/* Support Tipping CheckoutModal for Supporters-Only visibility */}
      <CheckoutModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        creator={creator}
        amount={300} // Default standard tip suggestion
        message="Unlocking gated post!"
        fanName=""
        source="Gated Post Link"
        paymentType="TIP"
        onSuccess={fetchPostAndCreator}
      />

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <Link 
          href={`/${username}?tab=posts`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-8 hover:opacity-85 transition-opacity"
          style={{ color: primaryColorHex }}
        >
          <ArrowLeft size={16} /> Back to creator posts
        </Link>

        <article className={`${cardClass} rounded-[2.5rem] border p-6 md:p-12`}>
          {/* Post Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-black/[0.05] dark:border-white/[0.05] pb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shrink-0 bg-white">
              <Image 
                src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                alt={creator.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">{creator.displayName}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 mt-1">
                <Calendar size={12} />
                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            {post.title}
          </h1>

          {/* Unlocked Post View */}
          {!post.isLocked ? (
            <div className="space-y-8">
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium opacity-90">
                {post.content}
              </div>

              {/* Attachments Section */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="border-t border-black/[0.05] dark:border-white/[0.05] pt-8 mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                    Exclusive Attachments ({post.attachments.length})
                  </h3>
                  <div className="space-y-3">
                    {post.attachments.map((file: any) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-black/[0.04] dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:scale-[1.01] transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0" style={{ color: primaryColorHex, backgroundColor: `${primaryColorHex}15` }}>
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate pr-2">{file.fileName}</p>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase">{file.mimeType.split('/')[1] || 'File'}</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-full bg-white dark:bg-zinc-800 shadow group-hover:scale-110 transition-transform">
                          <Download size={16} style={{ color: primaryColorHex }} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Locked Gated Overlay View */
            <div className="flex flex-col items-center text-center py-10">
              <div 
                className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 animate-pulse"
                style={{
                  backgroundColor: `${primaryColorHex}12`,
                  color: primaryColorHex
                }}
              >
                <Lock size={36} />
              </div>

              <h2 className="text-xl font-bold tracking-tight mb-2">Exclusive Post is Locked</h2>

              {post.visibility === 'PAID_UNLOCK' && (
                <>
                  <p className="text-xs font-semibold text-zinc-500 max-w-sm mb-8 leading-relaxed">
                    This post is premium content. You can instantly unlock the full post and its files for a one-time payment.
                  </p>
                  <button
                    onClick={() => setIsUnlockModalOpen(true)}
                    className="px-8 py-4 font-bold text-xs uppercase tracking-widest text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: primaryColorHex }}
                  >
                    Unlock for KES {Number(post.unlockPrice).toLocaleString()}
                  </button>
                </>
              )}

              {post.visibility === 'SUPPORTERS_ONLY' && (
                <>
                  <p className="text-xs font-semibold text-zinc-500 max-w-sm mb-8 leading-relaxed">
                    This post is exclusive to {creator.displayName}'s supporters. Send any tip amount to gain access!
                  </p>
                  <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="px-8 py-4 font-bold text-xs uppercase tracking-widest text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    style={{ backgroundColor: primaryColorHex }}
                  >
                    <Coffee size={16} /> Support to Unlock
                  </button>
                </>
              )}

              {post.visibility === 'MEMBERS_ONLY' && (
                <>
                  <p className="text-xs font-semibold text-zinc-500 max-w-sm mb-8 leading-relaxed">
                    This content is only visible to active membership tier subscribers. Join a membership tier to access.
                  </p>
                  <Link
                    href={`/${username}?tab=memberships`}
                    className="px-8 py-4 font-bold text-xs uppercase tracking-widest text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    style={{ backgroundColor: primaryColorHex }}
                  >
                    <Heart size={16} /> View Memberships
                  </Link>
                </>
              )}
            </div>
          )}
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
