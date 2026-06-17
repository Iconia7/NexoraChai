'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  X,
  Trash2,
  Edit3,
  Loader2,
  Lock,
  Globe,
  Heart,
  Sparkles,
  Paperclip,
  Eye,
  AlertCircle,
  Coffee
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function PostsDashboard() {
  const { token } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Posts and tiers state
  const [posts, setPosts] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'SUPPORTERS_ONLY' | 'MEMBERS_ONLY' | 'PAID_UNLOCK'>('PUBLIC');
  const [requiredTierId, setRequiredTierId] = useState<string>('');
  const [unlockPrice, setUnlockPrice] = useState('200');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [attachments, setAttachments] = useState<any[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 2. Fetch Creator's posts
  const fetchPosts = async () => {
    if (!token) return;
    setLoadingPosts(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load posts', 'error');
    } finally {
      setLoadingPosts(false);
    }
  };

  // 3. Fetch Membership Tiers for the gate selector dropdown
  const fetchTiers = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/memberships/tiers/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiers(res.data.filter((t: any) => t.status === 'ACTIVE'));
    } catch (err) {
      console.error('Failed to load tiers', err);
    }
  };

  useEffect(() => {
    if (mounted && token) {
      fetchPosts();
      fetchTiers();
    }
  }, [mounted, token]);

  const resetForm = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setVisibility('PUBLIC');
    setRequiredTierId('');
    setUnlockPrice('200');
    setStatus('PUBLISHED');
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/posts/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setAttachments((prev) => [...prev, res.data]);
      addToast('Attachment file uploaded successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'File upload failed. Max size is 100MB.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (storageKey: string) => {
    setAttachments((prev) => prev.filter((a) => a.storageKey !== storageKey));
  };

  // 5. Submit post create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!title.trim()) {
      addToast('Post title is required', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('Post content is required', 'error');
      return;
    }
    if (visibility === 'MEMBERS_ONLY' && !requiredTierId) {
      addToast('Please select a membership tier for gated access.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      content,
      visibility,
      requiredTierId: visibility === 'MEMBERS_ONLY' ? requiredTierId : null,
      unlockPrice: visibility === 'PAID_UNLOCK' ? Number(unlockPrice) : 0,
      status,
      attachments
    };

    try {
      if (editingPost) {
        await axios.patch(`${BACKEND_URL}/api/posts/${editingPost.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Post updated successfully', 'success');
      } else {
        await axios.post(`${BACKEND_URL}/api/posts`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Post created successfully', 'success');
      }
      setFormOpen(false);
      fetchPosts();
      resetForm();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to save post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (post: any) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setVisibility(post.visibility);
    setRequiredTierId(post.requiredTierId || '');
    setUnlockPrice(Number(post.unlockPrice).toString());
    setStatus(post.status);
    setAttachments(post.attachments || []);
    setFormOpen(true);
  };

  const handleDeleteClick = async (postId: string) => {
    if (!token || !confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Post deleted successfully', 'success');
      fetchPosts();
    } catch (err) {
      addToast('Failed to delete post', 'error');
    }
  };

  if (!profileData && loadingPosts) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Posts Dashboard...</div>;
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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Gated Posts</h1>
                <p className="text-brand-muted font-medium text-sm md:text-base">Publish exclusive content, restrict visibility, attach downloads, and reward supporters.</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setFormOpen(true);
                }}
                className="bg-[#914D00] hover:bg-[#7D4200] text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-brand-primary/10 w-full sm:w-auto justify-center"
              >
                <Plus size={16} /> New Post
              </button>
            </header>

            <div className="bg-white rounded-[2.5rem] card-shadow border border-black/[0.02] overflow-hidden p-6 md:p-8">
              {loadingPosts ? (
                <div className="space-y-4 py-6">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="w-full h-16 bg-zinc-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-brand-beige-light flex items-center justify-center text-brand-primary mb-6">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No posts published yet</h3>
                  <p className="text-brand-muted text-sm mb-6 leading-relaxed">Write articles, drop draft updates, or host media downloads gated for supporters and members.</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setFormOpen(true);
                    }}
                    className="bg-[#914D00] hover:bg-[#7D4200] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Write Your First Post
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <th className="py-4 px-2">Title</th>
                        <th className="py-4 px-2">Visibility Gate</th>
                        <th className="py-4 px-2">Attachments</th>
                        <th className="py-4 px-2">Status</th>
                        <th className="py-4 px-2">Published Date</th>
                        <th className="py-4 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {posts.map((post) => {
                        const visibilityConfig = {
                          PUBLIC: { label: 'Public', icon: Globe, style: 'bg-green-50 text-green-700 border-green-100' },
                          SUPPORTERS_ONLY: { label: 'Supporters Only', icon: Coffee, style: 'bg-amber-50 text-amber-700 border-amber-100' },
                          MEMBERS_ONLY: { label: 'Members Only', icon: Heart, style: 'bg-blue-50 text-blue-700 border-blue-100' },
                          PAID_UNLOCK: { label: `KES ${Number(post.unlockPrice).toLocaleString()} Unlock`, icon: Lock, style: 'bg-purple-50 text-purple-700 border-purple-100' }
                        }[post.visibility as 'PUBLIC' | 'SUPPORTERS_ONLY' | 'MEMBERS_ONLY' | 'PAID_UNLOCK'] || { label: post.visibility, icon: Lock, style: 'bg-gray-50 text-gray-700 border-gray-100' };

                        const VisIcon = visibilityConfig.icon;

                        return (
                          <tr key={post.id} className="text-xs font-semibold hover:bg-zinc-50/50 transition-colors">
                            <td className="py-4 px-2 max-w-xs">
                              <div className="font-bold text-zinc-900 truncate" title={post.title}>{post.title}</div>
                              <div className="text-[10px] text-zinc-400 font-medium truncate">{post.content.substring(0, 80)}...</div>
                            </td>
                            <td className="py-4 px-2">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1.5 w-fit ${visibilityConfig.style}`}>
                                <VisIcon size={10} />
                                {visibilityConfig.label}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-zinc-600 font-semibold flex items-center gap-1.5 mt-2">
                              <Paperclip size={14} className="text-zinc-400 shrink-0" />
                              {post.attachments?.length || 0} file{(post.attachments?.length !== 1) && 's'}
                            </td>
                            <td className="py-4 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                post.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>
                                {post.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-zinc-400 font-medium">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`/${profileData?.profile?.username}/posts/${post.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary p-2.5 rounded-xl transition-all"
                                  title="View Public Link"
                                >
                                  <Eye size={14} />
                                </a>
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary p-2.5 rounded-xl transition-all"
                                  title="Edit Post"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(post.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-all"
                                  title="Delete Post"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Post Form Modal */}
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
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/5 z-10 max-h-[90vh] flex flex-col text-gray-900"
              >
                <div className="flex justify-between items-center pb-4 border-b border-black/5 shrink-0">
                  <h2 className="font-bold text-lg tracking-tight">
                    {editingPost ? 'Edit Post' : 'Create Gated Post'}
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
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Post Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Exclusive high-res presets pack download"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Post Body Content</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your exclusive post content here... Supports plain text paragraphs."
                      rows={5}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Visibility Gate</label>
                      <select
                        value={visibility}
                        onChange={(e: any) => setVisibility(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                      >
                        <option value="PUBLIC">Public (Everyone)</option>
                        <option value="SUPPORTERS_ONLY">Supporters Only (Any Tip)</option>
                        <option value="MEMBERS_ONLY">Members Only (Subscribers)</option>
                        <option value="PAID_UNLOCK">Paid Unlock (One-time Fee)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Publishing Status</label>
                      <select
                        value={status}
                        onChange={(e: any) => setStatus(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                  </div>

                  {visibility === 'PAID_UNLOCK' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-3"
                    >
                      <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-widest">One-time Unlock Price (KES)</label>
                      <input
                        type="number"
                        min="1"
                        value={unlockPrice}
                        onChange={(e) => setUnlockPrice(e.target.value)}
                        className="w-full bg-white border border-purple-200 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/25 text-purple-900"
                      />
                    </motion.div>
                  )}

                  {visibility === 'MEMBERS_ONLY' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-3"
                    >
                      <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Required Membership Tier</label>
                      {tiers.length === 0 ? (
                        <div className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle size={14} /> You have no active membership tiers created. Please create a tier in the Memberships tab first.
                        </div>
                      ) : (
                        <select
                          value={requiredTierId}
                          onChange={(e) => setRequiredTierId(e.target.value)}
                          className="w-full bg-white border border-blue-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-blue-900 appearance-none cursor-pointer"
                        >
                          <option value="">-- Select Membership Tier --</option>
                          {tiers.map((t) => (
                            <option key={t.id} value={t.id}>{t.name} (KES {Number(t.price).toLocaleString()}/{t.billingInterval.toLowerCase()})</option>
                          ))}
                        </select>
                      )}
                    </motion.div>
                  )}

                  {/* Attachments Section */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Media / File Attachments (Optional)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="border border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-60 shrink-0"
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Paperclip size={14} /> Attach File
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-zinc-400 font-semibold leading-tight">Attach premium presets, images, source code files, or ZIP folders up to 100MB.</span>
                    </div>

                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2 border border-black/5 bg-zinc-50/50 p-4 rounded-2xl">
                        {attachments.map((file) => (
                          <div key={file.storageKey} className="flex justify-between items-center bg-white border border-zinc-100 p-3 rounded-xl text-xs font-semibold">
                            <span className="truncate pr-4 text-zinc-700">{file.fileName}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(file.storageKey)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      disabled={submitting || uploading}
                      className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-primary/5"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-1">
                          <Loader2 size={14} className="animate-spin" /> Saving...
                        </div>
                      ) : (
                        'Save Post'
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
