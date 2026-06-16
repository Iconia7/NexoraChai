'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Tag,
    Trash2,
    Plus,
    X,
    Phone,
    Mail,
    Copy,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function CRMPage() {
    const { token } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);
    const router = useRouter();
    
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    
    // CRM state
    const [supporters, setSupporters] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 1 });
    const [loading, setLoading] = useState(true);
    
    // Filters & Queries
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState('lastSupportedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    
    // Tag list state
    const [tags, setTags] = useState<any[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [creatingTag, setCreatingTag] = useState(false);
    
    // Supporter Detail Panel state
    const [selectedSupporterId, setSelectedSupporterId] = useState<string | null>(null);
    const [supporterDetail, setSupporterDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    
    // Notes form state
    const [newNote, setNewNote] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);
    
    // Tag assignment select state
    const [assignTagId, setAssignTagId] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Fetch Profile Info for Sidebar
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
                console.error('Error fetching dashboard profile info');
            }
        };
        fetchProfile();
    }, [token, router, mounted]);

    // 2. Fetch tags list
    const fetchTags = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${BACKEND_URL}/api/crm/tags`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTags(res.data);
        } catch (err) {
            console.error('Error fetching tags list');
        }
    };

    useEffect(() => {
        if (mounted && token) {
            fetchTags();
        }
    }, [mounted, token]);

    // 3. Fetch supporters with filters
    const fetchSupporters = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/crm/supporters`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: search || undefined,
                    tag: selectedTag || undefined,
                    sortBy,
                    sortOrder,
                    page,
                    limit: 10
                }
            });
            setSupporters(res.data.supporters);
            setPagination(res.data.pagination);
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to fetch supporters', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted && token) {
            const delayDebounce = setTimeout(() => {
                fetchSupporters();
            }, 300);
            return () => clearTimeout(delayDebounce);
        }
    }, [search, selectedTag, sortBy, sortOrder, page, token, mounted]);

    // 4. Fetch details when a supporter is selected
    const fetchSupporterDetail = async (id: string) => {
        if (!token) return;
        setDetailLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/crm/supporters/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupporterDetail(res.data);
        } catch (err: any) {
            addToast('Failed to load supporter details', 'error');
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSupporterId) {
            fetchSupporterDetail(selectedSupporterId);
        } else {
            setSupporterDetail(null);
        }
    }, [selectedSupporterId]);

    // 5. Note management
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedSupporterId || !newNote.trim()) return;
        setSubmittingNote(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/crm/supporters/${selectedSupporterId}/notes`, 
                { note: newNote }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSupporterDetail((prev: any) => ({
                ...prev,
                supporter: {
                    ...prev.supporter,
                    notes: [res.data, ...(prev.supporter.notes || [])]
                }
            }));
            setNewNote('');
            addToast('Note added successfully', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to add note', 'error');
        } finally {
            setSubmittingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!token) return;
        try {
            await axios.delete(`${BACKEND_URL}/api/crm/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupporterDetail((prev: any) => ({
                ...prev,
                supporter: {
                    ...prev.supporter,
                    notes: prev.supporter.notes.filter((n: any) => n.id !== noteId)
                }
            }));
            addToast('Note deleted', 'success');
        } catch (err: any) {
            addToast('Failed to delete note', 'error');
        }
    };

    // 6. Tag management
    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !newTagName.trim()) return;
        setCreatingTag(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/crm/tags`, 
                { name: newTagName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTags((prev) => [...prev, res.data]);
            setNewTagName('');
            addToast('Tag created successfully', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to create tag', 'error');
        } finally {
            setCreatingTag(false);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!token) return;
        try {
            await axios.delete(`${BACKEND_URL}/api/crm/tags/${tagId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTags((prev) => prev.filter((t) => t.id !== tagId));
            if (selectedTag === tags.find(t => t.id === tagId)?.name) {
                setSelectedTag('');
            }
            if (supporterDetail) {
                setSupporterDetail((prev: any) => ({
                    ...prev,
                    supporter: {
                        ...prev.supporter,
                        tagAssignments: prev.supporter.tagAssignments.filter((a: any) => a.tagId !== tagId)
                    }
                }));
            }
            fetchSupporters();
            addToast('Tag deleted', 'success');
        } catch (err: any) {
            addToast('Failed to delete tag', 'error');
        }
    };

    const handleAssignTag = async () => {
        if (!token || !selectedSupporterId || !assignTagId) return;
        try {
            const res = await axios.post(`${BACKEND_URL}/api/crm/supporters/${selectedSupporterId}/tags`,
                { tagId: assignTagId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSupporterDetail((prev: any) => {
                const alreadyExists = prev.supporter.tagAssignments.some((a: any) => a.tagId === assignTagId);
                if (alreadyExists) return prev;
                return {
                    ...prev,
                    supporter: {
                        ...prev.supporter,
                        tagAssignments: [...prev.supporter.tagAssignments, res.data]
                    }
                };
            });
            setAssignTagId('');
            fetchSupporters();
            addToast('Tag assigned', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to assign tag', 'error');
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        if (!token || !selectedSupporterId) return;
        try {
            await axios.delete(`${BACKEND_URL}/api/crm/supporters/${selectedSupporterId}/tags/${tagId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupporterDetail((prev: any) => ({
                ...prev,
                supporter: {
                    ...prev.supporter,
                    tagAssignments: prev.supporter.tagAssignments.filter((a: any) => a.tagId !== tagId)
                }
            }));
            fetchSupporters();
            addToast('Tag removed from supporter', 'success');
        } catch (err: any) {
            addToast('Failed to remove tag', 'error');
        }
    };

    const formatKES = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return `KES ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (!profileData && loading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading CRM...</div>;
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
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Supporters CRM</h1>
                                <p className="text-brand-muted font-medium text-sm md:text-base">Understand your relationships, manage contacts, tag profiles, and capture supporter notes.</p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                            <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/[0.02]">
                                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-widest mb-4">Filter Supporters</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                            placeholder="Search by name, email..."
                                            className="w-full bg-brand-beige-light/50 border border-black/5 pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                                        <select
                                            value={selectedTag}
                                            onChange={(e) => { setSelectedTag(e.target.value); setPage(1); }}
                                            className="w-full bg-brand-beige-light/50 border border-black/5 pl-10 pr-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
                                        >
                                            <option value="">All Tags</option>
                                            {tags.map((t) => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="relative">
                                        <ArrowUpDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                                        <select
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [field, order] = e.target.value.split('-');
                                                setSortBy(field);
                                                setSortOrder(order);
                                                setPage(1);
                                            }}
                                            className="w-full bg-brand-beige-light/50 border border-black/5 pl-10 pr-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
                                        >
                                            <option value="lastSupportedAt-desc">Recent Support (Newest)</option>
                                            <option value="lastSupportedAt-asc">Recent Support (Oldest)</option>
                                            <option value="totalSupported-desc">Total Supported (High-Low)</option>
                                            <option value="totalSupported-asc">Total Supported (Low-High)</option>
                                            <option value="supportCount-desc">Contribution Count (High-Low)</option>
                                            <option value="createdAt-desc">Date Added (Newest)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0C0C0C] text-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Tag Management</h3>
                                    <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            placeholder="Create new tag (e.g. VIP)..."
                                            className="flex-1 bg-white/10 border border-white/5 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-white/30"
                                        />
                                        <button
                                            type="submit"
                                            disabled={creatingTag || !newTagName.trim()}
                                            className="bg-brand-primary hover:bg-[#A35900] disabled:bg-white/10 disabled:text-white/30 text-white px-4 rounded-xl font-bold flex items-center justify-center transition-colors bg-[#914D00]"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </form>
                                    
                                    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                        {tags.map((t) => (
                                            <span key={t.id} className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-white/90 transition-colors">
                                                {t.name}
                                                <button
                                                    onClick={() => handleDeleteTag(t.id)}
                                                    className="text-white/40 hover:text-red-400 transition-colors"
                                                    title="Delete this tag globally"
                                                    type="button"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        {tags.length === 0 && (
                                            <p className="text-xs font-medium text-white/30 italic">No custom tags created yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/[0.02]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold tracking-tight">Supporters Network ({pagination.total})</h2>
                            </div>

                            {loading ? (
                                <div className="space-y-4 py-10">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-brand-beige-light/35 rounded-2xl border border-black/[0.02]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-black/10 shrink-0" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-black/10 rounded" />
                                                    <div className="h-3 w-48 bg-black/10 rounded" />
                                                </div>
                                            </div>
                                            <div className="h-6 w-20 bg-black/10 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {supporters.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedSupporterId(s.id)}
                                            className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                                                selectedSupporterId === s.id
                                                    ? 'bg-[#914D00]/5 border-[#914D00]/20 shadow-md translate-x-1'
                                                    : 'bg-brand-beige-light/25 hover:bg-brand-beige-light/50 border-black/[0.02] hover:border-black/5'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-[#914D00]/10 flex items-center justify-center font-bold text-brand-primary uppercase shrink-0">
                                                    {s.name?.[0] || 'S'}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-bold text-base tracking-tight">{s.name}</h4>
                                                        {s.tagAssignments?.map((a: any) => (
                                                            <span key={a.id} className="bg-black/5 text-black/70 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                                {a.tag?.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium text-brand-muted">
                                                        {s.email && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail size={12} /> {s.email}
                                                            </span>
                                                        )}
                                                        {s.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={12} /> {s.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-black/5">
                                                <div className="text-left md:text-right">
                                                    <p className="font-bold text-brand-secondary text-base">{formatKES(s.totalSupported)}</p>
                                                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-0.5">
                                                        {s.supportCount} Tip{s.supportCount > 1 ? 's' : ''} • Last: {new Date(s.lastSupportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {supporters.length === 0 && (
                                        <div className="text-center py-16">
                                            <Users size={40} className="text-brand-muted/40 mx-auto mb-4" />
                                            <p className="text-brand-muted font-bold text-sm">No supporters found matching those filters.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
                                    <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                                        Page {pagination.page} of {pagination.pages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="p-2 border border-black/10 rounded-xl hover:bg-black/[0.02] disabled:opacity-40 transition-colors"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            disabled={page === pagination.pages}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="p-2 border border-black/10 rounded-xl hover:bg-black/[0.02] disabled:opacity-40 transition-colors"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                
                <AnimatePresence>
                    {selectedSupporterId && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedSupporterId(null)}
                                className="fixed inset-0 bg-black z-40"
                            />

                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 border-l border-black/5 flex flex-col h-full overflow-hidden"
                            >
                                <div className="p-6 md:p-8 border-b border-black/5 flex items-center justify-between shrink-0 bg-brand-beige-light/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg tracking-tight">Relationship Profile</h3>
                                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Supporter ID: {selectedSupporterId.slice(-8)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSupporterId(null)}
                                        className="p-2 hover:bg-black/5 rounded-xl transition-colors text-brand-muted hover:text-black"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {detailLoading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
                                    </div>
                                ) : (
                                    supporterDetail && (
                                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
                                            <div className="p-6 bg-brand-beige-light/45 rounded-3xl border border-black/[0.02] flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-[#914D00] text-white flex items-center justify-center font-bold text-xl uppercase shrink-0 shadow-lg shadow-brand-primary/20">
                                                    {supporterDetail.supporter.name?.[0] || 'S'}
                                                </div>
                                                <div className="space-y-2 flex-1 min-w-0">
                                                    <h2 className="font-bold text-xl tracking-tight text-[#1A1A1A] truncate">{supporterDetail.supporter.name}</h2>
                                                    
                                                    <div className="space-y-1.5 text-xs text-brand-muted font-semibold">
                                                        {supporterDetail.supporter.email && (
                                                            <div className="flex items-center justify-between group">
                                                                <span className="flex items-center gap-2 truncate">
                                                                    <Mail size={12} className="text-brand-primary shrink-0" />
                                                                    {supporterDetail.supporter.email}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(supporterDetail.supporter.email);
                                                                        addToast('Email copied', 'success');
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded text-brand-primary transition-all shrink-0"
                                                                    type="button"
                                                                >
                                                                    <Copy size={10} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {supporterDetail.supporter.phone && (
                                                            <div className="flex items-center justify-between group">
                                                                <span className="flex items-center gap-2 truncate">
                                                                    <Phone size={12} className="text-brand-primary shrink-0" />
                                                                    {supporterDetail.supporter.phone}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(supporterDetail.supporter.phone);
                                                                        addToast('Phone number copied', 'success');
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded text-brand-primary transition-all shrink-0"
                                                                    type="button"
                                                                >
                                                                    <Copy size={10} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">Lifetime Value</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-brand-beige-light/30 rounded-2xl border border-black/[0.01]">
                                                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Total Contributed</p>
                                                        <p className="text-lg font-bold text-brand-secondary">{formatKES(supporterDetail.supporter.totalSupported)}</p>
                                                    </div>
                                                    <div className="p-4 bg-brand-beige-light/30 rounded-2xl border border-black/[0.01]">
                                                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Total Transactions</p>
                                                        <p className="text-lg font-bold text-brand-secondary">{supporterDetail.supporter.supportCount} transaction{supporterDetail.supporter.supportCount > 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-xs font-bold text-brand-muted uppercase tracking-widest">Assigned Tags</h4>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {supporterDetail.supporter.tagAssignments?.map((a: any) => (
                                                        <span key={a.id} className="inline-flex items-center gap-1 bg-brand-beige text-brand-primary px-3 py-1 rounded-full text-xs font-bold border border-[#914D00]/10">
                                                            {a.tag?.name}
                                                            <button
                                                                onClick={() => handleRemoveTag(a.tagId)}
                                                                className="hover:text-red-500 transition-colors ml-0.5"
                                                                type="button"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    {(!supporterDetail.supporter.tagAssignments || supporterDetail.supporter.tagAssignments.length === 0) && (
                                                        <p className="text-xs font-semibold text-brand-muted italic">No tags assigned to this supporter.</p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <select
                                                        value={assignTagId}
                                                        onChange={(e) => setAssignTagId(e.target.value)}
                                                        className="flex-1 bg-brand-beige-light/50 border border-black/5 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Choose tag to assign...</option>
                                                        {tags
                                                            .filter(t => !supporterDetail.supporter.tagAssignments?.some((a: any) => a.tagId === t.id))
                                                            .map(t => (
                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <button
                                                        onClick={handleAssignTag}
                                                        disabled={!assignTagId}
                                                        className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-black/5 disabled:text-brand-muted text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
                                                        type="button"
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">Relationship Notes</h4>
                                                
                                                <form onSubmit={handleAddNote} className="space-y-2 mb-6">
                                                    <textarea
                                                        value={newNote}
                                                        onChange={(e) => setNewNote(e.target.value)}
                                                        placeholder="Write notes about this supporter (e.g. key interactions, personal requests)..."
                                                        rows={3}
                                                        className="w-full bg-brand-beige-light/50 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                                                    />
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={submittingNote || !newNote.trim()}
                                                            className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-black/5 disabled:text-brand-muted text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md shadow-brand-primary/5"
                                                        >
                                                            Add Note
                                                        </button>
                                                    </div>
                                                </form>

                                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {supporterDetail.supporter.notes?.map((n: any) => (
                                                        <div key={n.id} className="p-4 bg-brand-beige-light/25 rounded-2xl border border-black/[0.02] relative group">
                                                            <button
                                                                onClick={() => handleDeleteNote(n.id)}
                                                                className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-brand-muted hover:text-red-500 transition-all p-1 rounded hover:bg-black/5"
                                                                type="button"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                            <p className="text-xs font-medium text-brand-muted mb-2">
                                                                {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            <p className="text-sm text-[#1A1A1A] leading-relaxed pr-6">{n.note}</p>
                                                        </div>
                                                    ))}
                                                    {(!supporterDetail.supporter.notes || supporterDetail.supporter.notes.length === 0) && (
                                                        <p className="text-xs font-semibold text-brand-muted italic text-center py-6">No relationship notes captured yet.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">Transaction Feed</h4>
                                                <div className="space-y-3">
                                                    {supporterDetail.transactions?.map((t: any) => (
                                                        <div key={t.id} className="flex justify-between items-center p-3 rounded-xl border border-black/[0.02] bg-brand-beige-light/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-xs font-bold text-brand-primary uppercase">
                                                                    {t.type[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold tracking-tight uppercase text-brand-primary">{t.type}</p>
                                                                    <p className="text-[9px] text-brand-muted font-semibold">
                                                                        {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {t.gateway}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-bold text-brand-secondary">{formatKES(t.netAmount)}</p>
                                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                                    t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {t.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!supporterDetail.transactions || supporterDetail.transactions.length === 0) && (
                                                        <p className="text-xs font-semibold text-brand-muted italic text-center py-6">No direct payment history found.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
