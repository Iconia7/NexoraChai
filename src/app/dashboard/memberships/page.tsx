'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  X,
  Trash2,
  Edit3,
  Loader2,
  Users,
  ShieldAlert,
  Settings,
  Calendar,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function MembershipsDashboard() {
  const { token } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Tabs: 'tiers' or 'subscribers'
  const [activeSubTab, setActiveSubTab] = useState<'tiers' | 'subscribers'>('tiers');

  // Memberships states
  const [tiers, setTiers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  // Tier form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('500');
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [benefits, setBenefits] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Profile for sidebar
  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data);
      } catch (err) {
        console.error('Error loading sidebar profile info');
      }
    };
    fetchProfile();
  }, [token, router, mounted]);

  // 2. Fetch Creator's membership tiers
  const fetchTiers = async () => {
    if (!token) return;
    setLoadingTiers(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/memberships/tiers/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiers(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load tiers', 'error');
    } finally {
      setLoadingTiers(false);
    }
  };

  // 3. Fetch Creator's subscriber list
  const fetchSubscribers = async () => {
    if (!token) return;
    setLoadingSubscribers(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/memberships/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load subscribers', 'error');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    if (mounted && token) {
      fetchTiers();
      fetchSubscribers();
    }
  }, [mounted, token]);

  const resetForm = () => {
    setEditingTier(null);
    setName('');
    setDescription('');
    setPrice('500');
    setBillingInterval('MONTHLY');
    setBenefits('');
  };

  // 4. Create or Update Tier
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      addToast('Tier name is required', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      description: description || null,
      price: Number(price),
      currency: 'KES',
      billingInterval,
      benefits: benefits || null
    };

    try {
      if (editingTier) {
        await axios.patch(`${BACKEND_URL}/api/memberships/tiers/${editingTier.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Membership tier updated successfully', 'success');
      } else {
        await axios.post(`${BACKEND_URL}/api/memberships/tiers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Membership tier created successfully', 'success');
      }
      setFormOpen(false);
      fetchTiers();
      resetForm();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to save tier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (tier: any) => {
    setEditingTier(tier);
    setName(tier.name);
    setDescription(tier.description || '');
    setPrice(Number(tier.price).toString());
    setBillingInterval(tier.billingInterval);
    setBenefits(tier.benefits || '');
    setFormOpen(true);
  };

  const handleDeleteClick = async (tierId: string) => {
    if (!token || !confirm('Are you sure you want to archive this membership tier? Existing subscriptions will remain active, but new users will not be able to join.')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/memberships/tiers/${tierId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Membership tier archived', 'success');
      fetchTiers();
    } catch (err) {
      addToast('Failed to archive tier', 'error');
    }
  };

  if (!profileData && (loadingTiers || loadingSubscribers)) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Membership Dashboard...</div>;
  }

  return (
    <div className="h-screen bg-brand-beige-light flex font-sans overflow-hidden">
      <DashboardSidebar
        displayName={profileData?.profile?.displayName || 'Creator'}
        username={profileData?.profile?.username || ''}
        avatarUrl={profileData?.profile?.avatarUrl}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <MobileDashboardNav onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <DashboardHeader />

          <div className="max-w-[1400px] mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Memberships</h1>
                <p className="text-brand-muted font-medium text-sm md:text-base">Launch recurring membership tiers, reward supporters, and manage your subscribers database.</p>
              </div>
              {activeSubTab === 'tiers' && (
                <button
                  onClick={() => {
                    resetForm();
                    setFormOpen(true);
                  }}
                  className="bg-[#914D00] hover:bg-[#7D4200] text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-brand-primary/10 w-full sm:w-auto justify-center"
                >
                  <Plus size={16} /> Add Tier
                </button>
              )}
            </header>

            {/* Custom Tab Selector */}
            <div className="flex border-b border-black/5 gap-6 mb-8">
              <button
                onClick={() => setActiveSubTab('tiers')}
                className={`pb-4 text-sm font-bold tracking-wide transition-all border-b-2 relative ${
                  activeSubTab === 'tiers' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Tiers / Perks
              </button>
              <button
                onClick={() => setActiveSubTab('subscribers')}
                className={`pb-4 text-sm font-bold tracking-wide transition-all border-b-2 relative ${
                  activeSubTab === 'subscribers' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Subscribers list
              </button>
            </div>

            {/* Content Tiers */}
            {activeSubTab === 'tiers' && (
              <div>
                {loadingTiers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] animate-pulse h-[250px]" />
                    ))}
                  </div>
                ) : tiers.length === 0 ? (
                  <div className="bg-white rounded-[2.5rem] p-12 card-shadow border border-black/[0.02] text-center max-w-lg mx-auto py-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-beige-light flex items-center justify-center text-brand-primary mb-6">
                      <Heart size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No tiers created yet</h3>
                    <p className="text-brand-muted text-sm mb-6 leading-relaxed">Create subscription tiers (e.g., Bronze, Silver, Gold) to receive monthly or yearly support from your fans.</p>
                    <button
                      onClick={() => {
                        resetForm();
                        setFormOpen(true);
                      }}
                      className="bg-[#914D00] hover:bg-[#7D4200] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Create Membership Tier
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tiers.map((tier) => {
                      const benefitsList = tier.benefits
                        ? tier.benefits.split(/[,\n]+/).map((b: string) => b.trim()).filter(Boolean)
                        : [];

                      return (
                        <div key={tier.id} className="bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] flex flex-col justify-between min-h-[300px]">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-amber-500/5 rounded-2xl flex items-center justify-center text-[#914D00] border border-amber-500/10 shrink-0">
                                <Heart size={22} className="fill-current" />
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                {tier.billingInterval}
                              </span>
                            </div>

                            <h3 className="font-bold text-lg leading-tight tracking-tight mb-2 truncate" title={tier.name}>{tier.name}</h3>
                            <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4">{tier.description || 'No description provided.'}</p>

                            <div className="text-xs font-bold mb-4">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-0.5">Price</span>
                              <span className="text-black font-extrabold text-base">KES {Number(tier.price).toLocaleString()}</span>
                            </div>

                            {benefitsList.length > 0 && (
                              <div className="space-y-1 bg-brand-beige-light/35 p-3.5 rounded-2xl border border-black/[0.01]">
                                <span className="block text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1.5">Benefits</span>
                                <ul className="space-y-1 text-[11px] font-semibold text-zinc-700">
                                  {benefitsList.slice(0, 3).map((benefit: string, idx: number) => (
                                    <li key={idx} className="truncate">• {benefit}</li>
                                  ))}
                                  {benefitsList.length > 3 && (
                                    <li className="text-[9px] text-[#914D00] font-bold uppercase tracking-wider">+{benefitsList.length - 3} more perks</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-6 border-t border-black/5 pt-4">
                            <button
                              onClick={() => handleEditClick(tier)}
                              className="flex-1 bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tier.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl transition-all"
                              title="Archive tier"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Subscribers list Tab */}
            {activeSubTab === 'subscribers' && (
              <div className="bg-white rounded-[2.5rem] card-shadow border border-black/[0.02] overflow-hidden p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-lg tracking-tight mb-1">Active Subscribers</h3>
                    <p className="text-xs text-brand-muted font-medium">Keep track of members, subscription statuses, payment gateways, and renewal dates.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-[#914D00]/5 text-[#914D00] px-4 py-2 rounded-full border border-amber-500/10">
                    <Users size={14} /> {subscribers.length} total subscribers
                  </div>
                </div>

                {loadingSubscribers ? (
                  <div className="space-y-4 py-6">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="w-full h-16 bg-zinc-50 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center mb-4">
                      <Users size={24} />
                    </div>
                    <p className="text-sm text-zinc-500 font-semibold mb-1">No subscribers yet</p>
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">Once users join your membership tiers via card or M-Pesa, they will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          <th className="py-4 px-2">Subscriber</th>
                          <th className="py-4 px-2">Active Tier</th>
                          <th className="py-4 px-2">Status</th>
                          <th className="py-4 px-2">Renewal Method</th>
                          <th className="py-4 px-2">Period End</th>
                          <th className="py-4 px-2 text-right">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {subscribers.map((sub) => {
                          const isMpesa = sub.renewalMethod === 'MPESA_MANUAL';
                          const statusClass =
                            sub.status === 'ACTIVE'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : sub.status === 'EXPIRED'
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-100';

                          return (
                            <tr key={sub.id} className="text-xs font-semibold hover:bg-zinc-50/50 transition-colors">
                              <td className="py-4 px-2">
                                <div className="font-bold text-zinc-900">{sub.supporter?.name}</div>
                                <div className="text-[10px] text-zinc-400 font-medium">{sub.supporter?.email || sub.supporter?.phone || 'No contact info'}</div>
                              </td>
                              <td className="py-4 px-2">
                                <span className="font-bold text-zinc-800">{sub.tier?.name}</span>
                                <span className="block text-[9px] text-zinc-400 uppercase">{sub.tier?.billingInterval}</span>
                              </td>
                              <td className="py-4 px-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusClass}`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-4 px-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase ${
                                  isMpesa ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {isMpesa ? 'M-Pesa Manual' : 'Card Auto'}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-zinc-600 font-medium">
                                {new Date(sub.currentPeriodEnd).toLocaleDateString('en-KE', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="py-4 px-2 text-zinc-400 text-right font-medium">
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Tier Form Modal */}
        <AnimatePresence>
          {formOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setFormOpen(false)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/5 z-10 max-h-[90vh] flex flex-col text-gray-900"
              >
                <div className="flex justify-between items-center pb-4 border-b border-black/5 shrink-0">
                  <h2 className="font-bold text-lg tracking-tight">
                    {editingTier ? 'Edit Membership Tier' : 'Add Membership Tier'}
                  </h2>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="p-2 hover:bg-black/5 rounded-xl text-zinc-400 hover:text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 pr-2 custom-scrollbar">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Tier Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bronze, Silver, Gold VIP"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Access behind-the-scenes content and early release templates..."
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Monthly Price (KES)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Billing Cycle</label>
                      <select
                        value={billingInterval}
                        onChange={(e: any) => setBillingInterval(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Included Benefits (Comma-separated)</label>
                    <textarea
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      placeholder="e.g. Exclusive Discord, Monthly Q&A, Free Templates"
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                    />
                    <span className="block text-[9px] text-zinc-400 font-medium mt-1">Separate benefits with commas or new lines.</span>
                  </div>

                  {/* Manual reminder heads-up in tier create */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-2.5 text-[11px] text-zinc-500 font-semibold">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      Kenyan M-Pesa subscribers are not recurring. Our system will automatically SMS them via Africa's Talking 3 days prior to expiration.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-black/5 pt-5 flex gap-3 justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => setFormOpen(false)}
                      className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-primary/5"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-1">
                          <Loader2 size={14} className="animate-spin" /> Saving...
                        </div>
                      ) : (
                        'Save Tier'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
