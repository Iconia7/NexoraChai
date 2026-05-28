'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Users, Coffee, Filter, ArrowRight } from 'lucide-react';
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

export default function ExplorePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('query');
      if (q) setSearchQuery(q);
    }
  }, []);

  const categories = ['All', 'Creative', 'Tech', 'Education', 'Gaming', 'Music', 'Vlog'];

  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FFF9F0] selection:bg-brand-primary/10">
      <PublicNavbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/5 rounded-full text-brand-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles size={14} /> Discover Excellence
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Explore <span className="text-brand-primary">Creators</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-brand-muted text-lg font-medium max-w-2xl mx-auto"
            >
              Support your favorite Kenyan artists, developers, and visionaries. 
              Discover the talent that moves the nation.
            </motion.p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input 
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/5 rounded-[2rem] py-4 md:py-6 pl-14 md:pl-16 pr-6 md:pr-8 text-sm font-bold shadow-xl shadow-black/[0.02] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'bg-white text-brand-muted border border-black/5 hover:border-brand-primary/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-black/5" />
              ))}
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/${creator.username}`}>
                    <div className="group bg-white rounded-[2.5rem] p-6 md:p-8 border border-black/5 hover:border-brand-primary/20 transition-all hover:shadow-2xl hover:shadow-brand-primary/5 relative overflow-hidden h-full flex flex-col">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                      
                      <div className="flex items-start gap-5 mb-6 relative">
                        <div className="w-16 h-16 rounded-2xl bg-brand-beige overflow-hidden border-2 border-white shadow-lg">
                          {creator.avatarUrl ? (
                            <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-primary">
                              {creator.displayName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl tracking-tight group-hover:text-brand-primary transition-colors">{creator.displayName}</h3>
                          <p className="text-brand-muted text-sm font-bold">@{creator.username}</p>
                        </div>
                      </div>

                      <p className="text-brand-muted text-sm font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">
                        {creator.bio || "No bio yet. This creator is ready to receive support from their fans!"}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-black/[0.03]">
                        <div className="flex items-center gap-2 text-brand-primary">
                          <TrendingUp size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{creator.views.toLocaleString()} Views</span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-muted font-bold text-xs">
                          Support <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-black/5">
              <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No creators found</h3>
              <p className="text-brand-muted font-medium">Try adjusting your search or category filters.</p>
            </div>
          )}

          {/* Footer CTA */}
          {!loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-24 p-12 bg-black text-white rounded-[3rem] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/20 blur-[100px]" />
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6">Are you a creator?</h2>
                <p className="text-white/60 font-medium mb-10 max-w-xl mx-auto">
                  Join the Nexora community and start receiving support from your fans instantly via M-Pesa or Card.
                </p>
                <Link href="/register" className="btn-primary py-5 px-10 inline-flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 transition-all text-sm font-bold uppercase tracking-widest rounded-2xl">
                  Start My Page <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
