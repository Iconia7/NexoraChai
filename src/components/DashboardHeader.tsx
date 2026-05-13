'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, Check } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function DashboardHeader() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
    // Refresh every 30 seconds
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

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
      <div className="relative w-full max-w-xl order-2 md:order-1">
        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-brand-muted/40" size={16} />
        <input
          type="text"
          placeholder="Search for anything..."
          className="w-full bg-white px-12 md:px-14 py-3.5 md:py-4 rounded-2xl md:rounded-full border border-black/[0.03] card-shadow font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-brand-muted/30"
        />
      </div>

      <div className="flex items-center justify-between w-full md:w-auto order-1 md:order-2">
        <h2 className="text-xl font-black md:hidden">Overview</h2>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-brand-muted border border-black/[0.03] card-shadow hover:bg-black/[0.01] transition-colors relative group">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}

            {/* Tooltip mockup - Hidden on very small screens or adjusted */}
            <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-black/5 p-6 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50 hidden md:block">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Notifications</p>
                {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[9px] font-black rounded-full">{unreadCount} New</span>}
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={`flex gap-3 items-start group/item p-2 rounded-xl transition-colors ${n.isRead ? 'opacity-60' : 'bg-brand-beige-light/30'}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-black/10' : 'bg-brand-primary'}`} />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-black leading-tight mb-1 text-foreground">{n.title}</p>
                        <p className="text-[10px] font-medium leading-relaxed text-brand-muted line-clamp-2">{n.message}</p>
                        <p className="text-[9px] font-bold text-black/20 mt-1 uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            markAsRead(n.id);
                          }}
                          className="p-1 hover:bg-brand-primary hover:text-white rounded-md transition-all text-brand-muted"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs font-bold text-brand-muted">All caught up! ✨</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <button className="w-full mt-4 pt-4 border-t border-black/5 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:text-brand-secondary transition-colors text-center">
                  View All Notifications
                </button>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
