'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  X,
  Trash2,
  Edit3,
  Loader2,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  User,
  CheckCircle,
  Paperclip,
  TrendingUp,
  Package
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface Question {
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export default function CommissionsDashboard() {
  const { token } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Tabs: 'services' or 'bookings'
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'bookings'>('services');

  // Commissions states
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Service form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Delivery modal state
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveringOrder, setDeliveringOrder] = useState<any>(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [delivering, setDelivering] = useState(false);
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);

  // Service Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('1500');
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [revisionCount, setRevisionCount] = useState(3);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // New question form helpers
  const [newQLabel, setNewQLabel] = useState('');
  const [newQType, setNewQType] = useState<'text' | 'textarea'>('text');
  const [newQRequired, setNewQRequired] = useState(true);

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

  // 2. Fetch Creator's Services
  const fetchServices = async () => {
    if (!token) return;
    setLoadingServices(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/commissions/services/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load services', 'error');
    } finally {
      setLoadingServices(false);
    }
  };

  // 3. Fetch Creator's Received Orders
  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/commissions/orders/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load bookings', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (mounted && token) {
      fetchServices();
      fetchOrders();
    }
  }, [mounted, token]);

  const resetForm = () => {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setPrice('1500');
    setDeliveryDays(5);
    setRevisionCount(3);
    setQuestions([]);
    setNewQLabel('');
    setNewQType('text');
    setNewQRequired(true);
  };

  // 4. Create or Update Service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!title.trim()) {
      addToast('Service title is required', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      description: description || null,
      price: Number(price),
      deliveryDays: Number(deliveryDays),
      revisionCount: Number(revisionCount),
      requirementsSchema: questions.length > 0 ? JSON.stringify(questions) : null,
      status: 'ACTIVE'
    };

    try {
      if (editingService) {
        await axios.patch(`${BACKEND_URL}/api/commissions/services/${editingService.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Commission service updated successfully', 'success');
      } else {
        await axios.post(`${BACKEND_URL}/api/commissions/services`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Commission service created successfully', 'success');
      }
      setFormOpen(false);
      fetchServices();
      resetForm();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to save service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (service: any) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description || '');
    setPrice(Number(service.price).toString());
    setDeliveryDays(service.deliveryDays);
    setRevisionCount(service.revisionCount);
    
    if (service.requirementsSchema) {
      try {
        setQuestions(JSON.parse(service.requirementsSchema));
      } catch (e) {
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
    setFormOpen(true);
  };

  const handleDeleteClick = async (serviceId: string) => {
    if (!token || !confirm('Are you sure you want to delete this commission service? Existing orders will not be affected, but no new requests can be made.')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/commissions/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Service archived successfully', 'success');
      fetchServices();
    } catch (err) {
      addToast('Failed to archive service', 'error');
    }
  };

  // Add requirement question helper
  const addQuestion = () => {
    if (!newQLabel.trim()) {
      addToast('Question label cannot be empty', 'error');
      return;
    }
    const newQ: Question = {
      label: newQLabel,
      type: newQType,
      required: newQRequired
    };
    setQuestions((prev) => [...prev, newQ]);
    setNewQLabel('');
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Status management for bookings
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    if (!token) return;
    try {
      await axios.patch(`${BACKEND_URL}/api/commissions/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast(`Order marked as ${status.replace('_', ' ').toLowerCase()}`, 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Deliver order upload helper
  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !deliveringOrder || !deliveryFile) return;

    setDelivering(true);
    const formData = new FormData();
    formData.append('file', deliveryFile);
    formData.append('message', deliveryMessage);

    try {
      await axios.post(`${BACKEND_URL}/api/commissions/orders/${deliveringOrder.id}/deliver`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      addToast('Deliverables uploaded and order status updated', 'success');
      setDeliveryOpen(false);
      setDeliveryFile(null);
      setDeliveryMessage('');
      fetchOrders();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Delivery upload failed', 'error');
    } finally {
      setDelivering(false);
    }
  };

  if (!profileData && (loadingServices || loadingOrders)) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Commission Dashboard...</div>;
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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Commissions</h1>
                <p className="text-brand-muted font-medium text-sm md:text-base">Launch digital services, track custom custom bookings, and deliver creative files.</p>
              </div>
              {activeSubTab === 'services' && (
                <button
                  onClick={() => {
                    resetForm();
                    setFormOpen(true);
                  }}
                  className="bg-[#914D00] hover:bg-[#7D4200] text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-brand-primary/10 w-full sm:w-auto justify-center"
                >
                  <Plus size={16} /> Add Service
                </button>
              )}
            </header>

            {/* Custom Sub Tab Selector */}
            <div className="flex border-b border-black/5 gap-6 mb-8">
              <button
                onClick={() => setActiveSubTab('services')}
                className={`pb-4 text-sm font-bold tracking-wide transition-all border-b-2 relative ${
                  activeSubTab === 'services' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Services Menu
              </button>
              <button
                onClick={() => setActiveSubTab('bookings')}
                className={`pb-4 text-sm font-bold tracking-wide transition-all border-b-2 relative ${
                  activeSubTab === 'bookings' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Client Bookings
              </button>
            </div>

            {/* Services Listing Panel */}
            {activeSubTab === 'services' && (
              <div>
                {loadingServices ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] animate-pulse h-[250px]" />
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <div className="bg-white rounded-[2.5rem] p-12 card-shadow border border-black/[0.02] text-center max-w-lg mx-auto py-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-beige-light flex items-center justify-center text-brand-primary mb-6">
                      <Sparkles size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Commissions are closed</h3>
                    <p className="text-brand-muted text-sm mb-6 leading-relaxed">List creative packages (e.g. website design, customized birthday greeting videos) for fans to buy and configure questionnaire gates for them.</p>
                    <button
                      onClick={() => {
                        resetForm();
                        setFormOpen(true);
                      }}
                      className="bg-[#914D00] hover:bg-[#7D4200] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Add Commission Service
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] flex flex-col justify-between min-h-[280px]">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-500/5 rounded-2xl flex items-center justify-center text-[#914D00] border border-amber-500/10 shrink-0">
                              <Sparkles size={22} className="fill-current" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                              {service.deliveryDays} Days
                            </span>
                          </div>

                          <h3 className="font-bold text-lg leading-tight tracking-tight mb-2 truncate" title={service.title}>{service.title}</h3>
                          <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed mb-4">{service.description || 'No description provided.'}</p>

                          <div className="text-xs font-bold mb-4 flex justify-between items-center bg-zinc-50 p-3 rounded-xl">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Price</span>
                              <span className="text-black font-extrabold text-sm">KES {Number(service.price).toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Revisions</span>
                              <span className="text-black font-bold text-xs">{service.revisionCount} included</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-t border-black/5 pt-4">
                          <button
                            onClick={() => handleEditClick(service)}
                            className="flex-1 bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl transition-all"
                            title="Archived tier"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings received Panel */}
            {activeSubTab === 'bookings' && (
              <div className="bg-white rounded-[2.5rem] card-shadow border border-black/[0.02] overflow-hidden p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-lg tracking-tight mb-1">Bookings Received</h3>
                    <p className="text-xs text-brand-muted font-medium">Fulfill creative orders, accept requests, upload completed files, and monitor timelines.</p>
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="space-y-4 py-6">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="w-full h-16 bg-zinc-50 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center mb-4">
                      <Package size={24} />
                    </div>
                    <p className="text-sm text-zinc-500 font-semibold mb-1">No bookings found</p>
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">Active commission orders and payments will appear here once fans checkout.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const statusColor = {
                        PENDING_PAYMENT: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                        PAID: 'bg-blue-50 text-blue-700 border-blue-100',
                        IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
                        DELIVERED: 'bg-purple-50 text-purple-700 border-purple-100',
                        COMPLETED: 'bg-green-50 text-green-700 border-green-100',
                        CANCELLED: 'bg-red-50 text-red-700 border-red-100'
                      }[order.status as string] || 'bg-gray-50 text-gray-700 border-gray-100';

                      // Parse user requirement questionnaire responses
                      let requirementsObj: Record<string, string> = {};
                      try {
                        requirementsObj = JSON.parse(order.requirements);
                      } catch (e) {}

                      return (
                        <div key={order.id} className="border border-black/5 rounded-3xl p-6 hover:shadow-md transition-shadow bg-zinc-50/20">
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 pb-4 mb-4">
                            <div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">ORDER ID</span>
                              <span className="font-mono text-xs font-bold text-zinc-800">#{order.id.substring(0, 10)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">SERVICE HIRED</span>
                              <span className="font-bold text-xs text-zinc-900">{order.service?.title}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">STATUS</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${statusColor}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">AMOUNT</span>
                              <span className="font-bold text-sm text-[#914D00]">KES {Number(order.amount).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Client card info */}
                            <div className="space-y-3 bg-white p-4 rounded-2xl border border-black/[0.02]">
                              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                                <User size={12} /> Buyer Contact Details
                              </h5>
                              <p className="text-xs font-bold text-zinc-800">{order.buyerName}</p>
                              <p className="text-xs text-zinc-500 font-medium">{order.buyerEmail}</p>
                              {order.buyerPhone && <p className="text-xs text-zinc-500 font-medium">{order.buyerPhone}</p>}
                              
                              <div className="text-[10px] text-zinc-400 font-semibold pt-2 flex items-center gap-1">
                                <Calendar size={12} />
                                Ordered: {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Client answers questionnaire */}
                            <div className="space-y-3 bg-white p-4 rounded-2xl border border-black/[0.02]">
                              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                                <FileText size={12} /> Questionnaire Specifications
                              </h5>
                              {Object.keys(requirementsObj).length > 0 ? (
                                <div className="space-y-2.5 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
                                  {Object.entries(requirementsObj).map(([question, answer], idx) => (
                                    <div key={idx} className="text-xs leading-relaxed font-semibold">
                                      <p className="text-[9px] font-bold text-zinc-400 uppercase">{question}</p>
                                      <p className="text-zinc-800 bg-zinc-50 p-2 rounded-xl mt-0.5 border border-black/[0.01]">{answer}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-zinc-400 font-medium italic">No specifications provided.</p>
                              )}
                            </div>
                          </div>

                          {/* Deliveries made */}
                          {order.deliveries && order.deliveries.length > 0 && (
                            <div className="mb-6 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                              <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Package size={12} /> Uploaded Deliveries
                              </h5>
                              <div className="space-y-2">
                                {order.deliveries.map((delivery: any) => (
                                  <div key={delivery.id} className="text-xs font-semibold flex justify-between items-center bg-white p-3 rounded-xl border border-purple-200/25">
                                    <div>
                                      <p className="text-zinc-700 font-semibold leading-relaxed">{delivery.message}</p>
                                      {delivery.fileUrl && <span className="text-[9px] text-zinc-400 mt-1 block">Storage Ref: {delivery.fileUrl.substring(0, 15)}...</span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400">{new Date(delivery.createdAt).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action triggers */}
                          <div className="flex flex-wrap gap-2 border-t border-black/5 pt-4 mt-4 justify-end">
                            {order.status === 'PAID' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'IN_PROGRESS')}
                                className="bg-[#914D00] hover:bg-[#7D4200] text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                              >
                                Accept Order
                              </button>
                            )}

                            {(order.status === 'PAID' || order.status === 'IN_PROGRESS') && (
                              <>
                                <button
                                  onClick={() => {
                                    setDeliveringOrder(order);
                                    setDeliveryOpen(true);
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                                >
                                  Deliver Work
                                </button>
                                <button
                                  onClick={() => handleOrderStatusChange(order.id, 'CANCELLED')}
                                  className="bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                                >
                                  Cancel Order
                                </button>
                              </>
                            )}

                            {order.status === 'DELIVERED' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'COMPLETED')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                              >
                                <CheckCircle size={12} /> Mark Completed
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Creator Service Creation Modal */}
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
                    {editingService ? 'Edit Commission Service' : 'Add Commission Service'}
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
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Service Package Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. customized birthday greeting song, 1-on-1 coaching call"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Provide a description of what you will provide in this package..."
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Price (KES)</label>
                      <input
                        type="number"
                        required
                        min="50"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Delivery Time (Days)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Revisions</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={revisionCount}
                        onChange={(e) => setRevisionCount(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Requirements Questionnaire Builder */}
                  <div className="border-t border-black/5 pt-4 mt-4">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-2">Build Requirements Questionnaire</label>
                    <p className="text-[10px] text-zinc-400 font-semibold mb-4 leading-relaxed">Configure spec questions that buyers must answer during checkout (e.g. Website URL, birthday name reference).</p>
                    
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-black/[0.02] space-y-3 mb-4">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Question Label</label>
                        <input
                          type="text"
                          value={newQLabel}
                          onChange={(e) => setNewQLabel(e.target.value)}
                          placeholder="e.g. What name should I greet?"
                          className="w-full bg-white border border-zinc-200 px-3.5 py-2.5 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Answer Field Type</label>
                          <select
                            value={newQType}
                            onChange={(e: any) => setNewQType(e.target.value)}
                            className="w-full bg-white border border-zinc-200 px-3.5 py-2.5 rounded-lg text-xs font-bold focus:outline-none"
                          >
                            <option value="text">Text Input (Short)</option>
                            <option value="textarea">Textarea (Long)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between border border-zinc-200 bg-white px-3.5 py-2.5 rounded-lg mt-4.5">
                          <span className="text-[10px] font-bold uppercase text-zinc-500">Required</span>
                          <input
                            type="checkbox"
                            checked={newQRequired}
                            onChange={(e) => setNewQRequired(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-zinc-300"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                      >
                        Add Question
                      </button>
                    </div>

                    {/* Render current questions */}
                    {questions.length > 0 && (
                      <div className="space-y-2 border border-black/5 bg-zinc-50/50 p-4 rounded-2xl">
                        <span className="block text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Questionnaire Preview</span>
                        {questions.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white border border-zinc-100 p-3 rounded-xl text-xs font-semibold">
                            <div>
                              <span className="text-zinc-800 font-bold pr-2">{q.label}</span>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase">({q.type} • {q.required ? 'Required' : 'Optional'})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(idx)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete Question"
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
                      disabled={submitting}
                      className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-primary/5"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-1">
                          <Loader2 size={14} className="animate-spin" /> Saving...
                        </div>
                      ) : (
                        'Save Service'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Deliver work upload Modal */}
        <AnimatePresence>
          {deliveryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeliveryOpen(false)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/5 z-10 text-gray-900"
              >
                <div className="flex justify-between items-center pb-4 border-b border-black/5">
                  <h2 className="font-bold text-lg tracking-tight">Deliver Commission Work</h2>
                  <button
                    onClick={() => setDeliveryOpen(false)}
                    className="p-2 hover:bg-black/5 rounded-xl text-zinc-400 hover:text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleDeliverSubmit} className="py-6 space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Delivery Message / Note</label>
                    <textarea
                      required
                      value={deliveryMessage}
                      onChange={(e) => setDeliveryMessage(e.target.value)}
                      placeholder="Hi! Here is your completed booking file. Thank you for your support!"
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Deliverable File (Max 100MB)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        required
                        ref={deliveryFileInputRef}
                        onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => deliveryFileInputRef.current?.click()}
                        className="border border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shrink-0"
                      >
                        <Paperclip size={14} /> Choose File
                      </button>
                      <span className="text-[10px] text-zinc-400 font-semibold leading-tight truncate">
                        {deliveryFile ? deliveryFile.name : 'Select video, audio, ZIP, PDF, etc.'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-black/5 pt-5 flex gap-3 justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeliveryOpen(false)}
                      className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={delivering || !deliveryFile}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md"
                    >
                      {delivering ? (
                        <div className="flex items-center gap-1">
                          <Loader2 size={14} className="animate-spin" /> Uploading Delivery...
                        </div>
                      ) : (
                        'Upload & Deliver'
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
