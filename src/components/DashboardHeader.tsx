'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Bell, Check, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function DashboardHeader() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('');
  const [creators, setCreators] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close notification panel on outside click / touch
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notifOpen]);

  const fetchCreators = async () => {
    if (creators.length > 0) return;
    setLoadingSearch(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/creators`);
      setCreators(res.data || []);
    } catch (err) {
      console.error('Failed to fetch creators for search');
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = creators.filter(c =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, creators]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      window.location.href = `/explore?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/creators/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
      <div className="relative w-full max-w-xl order-2 md:order-1">
        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-brand-muted/40" size={16} />
        <input
          type="text"
          placeholder="Search creators..."
          value={searchQuery}
          onFocus={() => {
            fetchCreators();
            setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white px-12 md:px-14 py-3.5 md:py-4 rounded-2xl md:rounded-full border border-black/[0.03] card-shadow font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-brand-muted/30"
        />

        {showDropdown && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 p-4 z-50 max-h-80 overflow-y-auto no-scrollbar">
            {loadingSearch ? (
              <p className="text-xs font-bold text-brand-muted text-center py-4">Loading creators...</p>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest px-2 mb-2 text-left">Creators Found</p>
                {searchResults.map((c) => (
                  <a
                    key={c.id}
                    href={`/${c.username}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-beige-light/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-beige overflow-hidden shrink-0 border border-black/5">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-brand-primary uppercase">
                          {c.displayName[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground group-hover:text-brand-primary transition-colors">{c.displayName}</p>
                      <p className="text-[10px] font-bold text-brand-muted">@{c.username}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-brand-muted text-center py-4">No creators match &quot;{searchQuery}&quot;</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full md:w-auto order-1 md:order-2">
        <h2 className="text-xl font-bold md:hidden">Overview</h2>
        <div className="flex items-center gap-4">

          {/* Notification Bell — click to open, works on all devices */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-brand-muted border border-black/[0.03] card-shadow hover:bg-black/[0.01] active:scale-95 transition-all relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {/* Notification panel — visible on all screen sizes when open */}
            {notifOpen && (
              <div className="absolute top-full right-0 mt-3 w-[min(340px,calc(100vw-2rem))] bg-white rounded-[2rem] shadow-2xl border border-black/5 p-6 z-[999]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Notifications</p>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <>
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold rounded-full">{unreadCount} New</span>
                        <button
                          onClick={markAllAsRead}
                          className="text-[9px] font-bold text-brand-primary uppercase tracking-widest hover:underline"
                        >
                          Mark all read
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 items-start p-2.5 rounded-xl transition-colors ${n.isRead ? 'opacity-50' : 'bg-brand-beige-light/40'}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-black/10' : 'bg-brand-primary'}`} />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-bold leading-tight mb-1 text-foreground">{n.title}</p>
                          <p className="text-[10px] font-medium leading-relaxed text-brand-muted line-clamp-2">{n.message}</p>
                          <p className="text-[9px] font-bold text-black/20 mt-1 uppercase tracking-tighter">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="p-1 hover:bg-brand-primary hover:text-white rounded-md transition-all text-brand-muted shrink-0"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <CheckCircle2 size={20} className="mx-auto mb-2 text-brand-muted/30" />
                      <p className="text-xs font-bold text-brand-muted">All caught up</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button className="w-full mt-4 pt-4 border-t border-black/5 text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:text-brand-secondary transition-colors text-center">
                    View All Notifications
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
