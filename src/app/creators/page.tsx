'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Heart, Zap, Globe, Sparkles, ArrowRight, Star } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  category?: string;
  views: number;
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators`);
        setCreators(res.data);
      } catch (err) {
        console.error('Failed to fetch creators');
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const topCreator = creators[0];
  const otherCreators = creators.slice(1);

  return (
    <div className="min-h-screen bg-[#FFF9F0] selection:bg-brand-primary/10 no-scrollbar">
      <PublicNavbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-[0.2em] mb-4"
            >
              <TrendingUp size={14} /> Trending Now
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight"
            >
              Meet Our <span className="text-brand-primary italic">Stars</span>
            </motion.h1>
          </div>

          {/* Featured Creator Spotlight */}
          {!loading && topCreator && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group mb-24"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Link href={`/${topCreator.username}`}>
                <div className="relative bg-white rounded-[3.5rem] p-8 md:p-16 border border-black/5 shadow-2xl flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-bl-[10rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
                  
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-brand-beige overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                    {topCreator.avatarUrl ? (
                      <img src={topCreator.avatarUrl} alt={topCreator.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-brand-primary">
                        {topCreator.displayName[0]}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-brand-primary text-white p-2 rounded-xl shadow-lg">
                      <Star size={20} fill="white" />
                    </div>
                  </div>

                  <div className="flex-1 text-center lg:text-left relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                      <Sparkles size={12} /> Featured Creator
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{topCreator.displayName}</h2>
                    <p className="text-brand-muted text-lg font-medium mb-10 leading-relaxed max-w-2xl">
                      {topCreator.bio || "This featured creator is leading the way on Nexora. Join their journey and support their incredible work today."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1 opacity-60">Total Views</span>
                          <span className="text-2xl font-bold">{topCreator.views.toLocaleString()}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1 opacity-60">Category</span>
                          <span className="text-2xl font-bold text-brand-primary">{topCreator.category || 'Creative'}</span>
                       </div>
                       <div className="h-12 w-[1px] bg-black/5 hidden md:block" />
                       <div className="btn-primary py-4 px-8 bg-black text-white hover:bg-brand-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 rounded-2xl">
                          Support Now <ArrowRight size={16} />
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Leaderboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
               [1,2,3,4,5,6,7,8].map(i => (
                 <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-black/5" />
               ))
            ) : otherCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/${creator.username}`}>
                  <div className="group bg-white rounded-[2.5rem] p-6 border border-black/5 hover:border-brand-primary/20 transition-all hover:shadow-xl relative flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-brand-beige-light mb-4 overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                      {creator.avatarUrl ? (
                         <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-primary">
                          {creator.displayName[0]}
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-lg tracking-tight mb-1 group-hover:text-brand-primary transition-colors">{creator.displayName}</h4>
                    <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest mb-4">@{creator.username}</p>
                    
                    <div className="mt-auto pt-4 border-t border-black/[0.02] w-full flex items-center justify-between text-brand-muted">
                       <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest">
                          <Users size={12} /> {creator.views}
                       </div>
                       <Zap size={14} className="group-hover:text-brand-primary group-hover:fill-brand-primary transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Join CTA */}
          <div className="mt-32 text-center">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="max-w-3xl mx-auto"
             >
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-primary animate-bounce">
                   <Zap size={32} fill="currentColor" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-8">Want to see yourself <span className="text-brand-primary underline decoration-brand-beige underline-offset-8">here?</span></h2>
                <p className="text-brand-muted text-xl font-medium mb-12">
                   Start your Nexora Chai page today and join the elite community of Kenyan creators earning their worth.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <Link href="/register" className="w-full sm:w-auto btn-primary py-6 px-12 bg-brand-primary text-white text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
                      Become a Creator
                   </Link>
                   <Link href="/about" className="w-full sm:w-auto px-12 py-6 bg-white border border-black/5 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-black/[0.02] transition-all">
                      Learn More
                   </Link>
                </div>
             </motion.div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
