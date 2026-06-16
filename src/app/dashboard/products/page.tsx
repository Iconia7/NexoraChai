'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Plus,
    X,
    Trash2,
    Edit3,
    Upload,
    Loader2,
    DollarSign,
    ExternalLink,
    Lock,
    Eye,
    Tag
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function DigitalProductsDashboard() {
    const { token } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);

    // Products lists
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [formOpen, setFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Form inputs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0');
    const [isFree, setIsFree] = useState(false);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [downloadLimit, setDownloadLimit] = useState(5);
    const [productStatus, setProductStatus] = useState<'DRAFT' | 'ACTIVE' | 'PAUSED'>('DRAFT');
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    // Upload status
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Fetch Profile for layout sidebar
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

    // 2. Fetch Creator's products
    const fetchProducts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/products/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data);
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted && token) {
            fetchProducts();
        }
    }, [mounted, token]);

    // 3. File upload handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${BACKEND_URL}/api/products/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadedFiles((prev) => [...prev, res.data]);
            addToast('File uploaded successfully', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.error || 'File upload failed. Max size is 100MB.', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeUploadedFile = (storageKey: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.storageKey !== storageKey));
    };

    // 4. Form Submit (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (uploadedFiles.length === 0) {
            addToast('Please upload at least one file for the digital product.', 'error');
            return;
        }

        setSubmitting(true);

        const payload = {
            title,
            description: description || null,
            price: isFree ? 0 : Number(price),
            currency: 'KES',
            status: productStatus,
            coverImageUrl: coverImageUrl || null,
            category: category || null,
            isFree,
            downloadLimit: Number(downloadLimit),
            files: uploadedFiles
        };

        try {
            if (editingProduct) {
                await axios.patch(`${BACKEND_URL}/api/products/${editingProduct.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addToast('Product updated successfully', 'success');
            } else {
                await axios.post(`${BACKEND_URL}/api/products`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addToast('Product created successfully', 'success');
            }
            setFormOpen(false);
            fetchProducts();
            resetForm();
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Submit failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (product: any) => {
        setEditingProduct(product);
        setTitle(product.title);
        setDescription(product.description || '');
        setPrice(Number(product.price).toString());
        setIsFree(product.isFree);
        setCoverImageUrl(product.coverImageUrl || '');
        setCategory(product.category || '');
        setDownloadLimit(product.downloadLimit);
        setProductStatus(product.status);
        setUploadedFiles(product.files || []);
        setFormOpen(true);
    };

    const handleDeleteClick = async (productId: string) => {
        if (!token || !confirm('Are you sure you want to delete this product? All files and orders will be removed.')) return;

        try {
            await axios.delete(`${BACKEND_URL}/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Product deleted', 'success');
            fetchProducts();
        } catch (err) {
            addToast('Failed to delete product', 'error');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setTitle('');
        setDescription('');
        setPrice('0');
        setIsFree(false);
        setCoverImageUrl('');
        setCategory('');
        setDownloadLimit(5);
        setProductStatus('DRAFT');
        setUploadedFiles([]);
    };

    const formatKES = (val: number | string) => {
        return `KES ${Number(val).toLocaleString()}`;
    };

    if (!profileData && loading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Shop Dashboard...</div>;
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
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">My Shop</h1>
                                <p className="text-brand-muted font-medium text-sm md:text-base">Sell guides, presets, digital files, and exclusive templates directly to your audience.</p>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setFormOpen(true);
                                }}
                                className="bg-[#914D00] hover:bg-[#7D4200] text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-[1.02] shadow-xl shadow-brand-primary/10 w-full sm:w-auto justify-center"
                            >
                                <Plus size={16} /> Add Product
                            </button>
                        </header>

                        {/* List grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, idx) => (
                                    <div key={idx} className="bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] animate-pulse h-[300px]" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-12 card-shadow border border-black/[0.02] text-center max-w-lg mx-auto py-16 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-brand-beige-light flex items-center justify-center text-brand-primary mb-6">
                                    <ShoppingBag size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No products listed yet</h3>
                                <p className="text-brand-muted text-sm mb-6 leading-relaxed">Listing your first product is quick and easy. Set a price, upload files, and share your link.</p>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setFormOpen(true);
                                    }}
                                    className="bg-[#914D00] hover:bg-[#7D4200] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    Add Digital Product
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((p) => (
                                    <div key={p.id} className="bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] flex flex-col justify-between min-h-[340px]">
                                        <div>
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="w-14 h-14 bg-brand-beige-light rounded-2xl overflow-hidden flex items-center justify-center border border-black/[0.03] shrink-0">
                                                    {p.coverImageUrl ? (
                                                        <img src={p.coverImageUrl} alt={p.title} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <ShoppingBag className="text-brand-primary" size={24} />
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                        p.status === 'ACTIVE'
                                                            ? 'bg-green-50 text-green-700 border border-green-100'
                                                            : p.status === 'PAUSED'
                                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                                            : 'bg-gray-50 text-gray-500 border border-gray-100'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-lg leading-tight tracking-tight mb-2 truncate" title={p.title}>{p.title}</h3>
                                            <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4">{p.description || 'No description provided.'}</p>

                                            <div className="flex flex-wrap gap-4 text-xs font-semibold text-brand-muted bg-brand-beige-light/30 p-3 rounded-2xl border border-black/[0.01]">
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest opacity-60">Price</span>
                                                    <span className="text-black font-bold">{p.isFree ? 'FREE' : formatKES(p.price)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest opacity-60">Files</span>
                                                    <span className="text-black font-bold">{p.files?.length || 0} file{p.files?.length !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest opacity-60">Limit</span>
                                                    <span className="text-black font-bold">{p.downloadLimit} downloads</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-6 border-t border-black/5 pt-4">
                                            <button
                                                onClick={() => handleEditClick(p)}
                                                className="flex-1 bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Edit3 size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(p.id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl transition-all"
                                                title="Delete product"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <a
                                                href={`/${profileData?.profile?.username}/products/${p.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-brand-beige-light hover:bg-black/5 text-[#1A1A1A] p-3 rounded-xl transition-all"
                                                title="View storefront link"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Form Modal */}
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
                                className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/5 z-10 max-h-[90vh] flex flex-col"
                            >
                                <div className="flex justify-between items-center pb-4 border-b border-black/5 shrink-0">
                                    <h2 className="font-bold text-lg tracking-tight">
                                        {editingProduct ? 'Edit Digital Product' : 'Add Digital Product'}
                                    </h2>
                                    <button
                                        onClick={() => setFormOpen(false)}
                                        className="p-2 hover:bg-black/5 rounded-xl text-brand-muted hover:text-black transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Product Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. Creator Growth Blueprint"
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Description</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Provide details about what downloaders receive..."
                                                rows={3}
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Pricing Type</label>
                                            <div className="flex items-center gap-2 h-11">
                                                <input
                                                    type="checkbox"
                                                    id="isFree"
                                                    checked={isFree}
                                                    onChange={(e) => setIsFree(e.target.checked)}
                                                    className="w-4 h-4 text-[#914D00] focus:ring-[#914D00] border-gray-300 rounded"
                                                />
                                                <label htmlFor="isFree" className="text-sm font-bold text-brand-muted uppercase cursor-pointer">This is a free product</label>
                                            </div>
                                        </div>

                                        {!isFree && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Price (KES)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Download Expiry Limit</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max="100"
                                                value={downloadLimit}
                                                onChange={(e) => setDownloadLimit(Number(e.target.value))}
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Product Status</label>
                                            <select
                                                value={productStatus}
                                                onChange={(e: any) => setProductStatus(e.target.value)}
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
                                            >
                                                <option value="DRAFT">Draft (Invisible)</option>
                                                <option value="ACTIVE">Active (Storefront visible)</option>
                                                <option value="PAUSED">Paused (Purchases closed)</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Cover Image URL (Optional)</label>
                                            <input
                                                type="url"
                                                value={coverImageUrl}
                                                onChange={(e) => setCoverImageUrl(e.target.value)}
                                                placeholder="https://example.com/cover.jpg"
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1.5">Category Tag (Optional)</label>
                                            <input
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="e.g. eBook, Presets"
                                                className="w-full bg-brand-beige-light/40 border border-black/5 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                            />
                                        </div>
                                    </div>

                                    {/* File Uploader */}
                                    <div className="border-t border-black/5 pt-5">
                                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3">Product File Uploads</label>
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept=".pdf,.zip,.png,.jpg,.jpeg,.mp3,.mp4,.json,.txt"
                                            />
                                            <button
                                                type="button"
                                                disabled={uploading}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border border-dashed border-black/20 hover:border-brand-primary py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors text-brand-muted hover:text-brand-primary cursor-pointer disabled:opacity-40"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin text-brand-primary" /> Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={16} /> Upload Digital File
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[10px] text-brand-muted font-semibold leading-normal">Upload PDF, ZIP, image, or audio files.<br/>Max file size limit: 100MB.</p>
                                        </div>

                                        {/* List of uploaded files */}
                                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                            {uploadedFiles.map((file, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-black/[0.02] bg-brand-beige-light/35">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold truncate pr-4">{file.fileName}</p>
                                                        <p className="text-[9px] text-brand-muted font-bold uppercase tracking-wider">
                                                            {file.mimeType} • {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUploadedFile(file.storageKey)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {uploadedFiles.length === 0 && (
                                                <p className="text-xs text-brand-muted italic text-center py-4 bg-brand-beige-light/10 rounded-2xl border border-dashed border-black/5">No files attached to this product yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="border-t border-black/5 pt-5 flex gap-3 justify-end shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setFormOpen(false)}
                                            className="px-5 py-3 border border-black/10 hover:bg-black/[0.02] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || uploading || uploadedFiles.length === 0}
                                            className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-black/5 disabled:text-brand-muted text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-primary/5"
                                        >
                                            {submitting ? (
                                                <div className="flex items-center gap-1">
                                                    <Loader2 size={14} className="animate-spin" /> Saving...
                                                </div>
                                            ) : (
                                                'Save Product'
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
