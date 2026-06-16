'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  Plus,
  X,
  Users,
  Settings,
  Megaphone,
  Shield,
  Trash2,
  Edit3,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  UserCheck,
  CheckCircle,
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

interface OrgCampaign {
  id: string;
  title: string;
  description: string | null;
  targetAmount: string;
  currentAmount: string;
  status: string;
  createdAt: string;
}

interface OrgMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'FINANCE' | 'VIEWER';
  user: {
    email: string;
    profile?: {
      displayName: string;
      username: string;
      avatarUrl: string | null;
    } | null;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  logoUrl: string | null;
  verified: boolean;
  ownerUserId: string;
  members: OrgMember[];
  campaigns: OrgCampaign[];
}

export default function OrganizationsDashboard() {
  const { token } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Listing / selection states
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Tab state inside organization detail view: 'campaigns' | 'members' | 'settings'
  const [activeTab, setActiveTab] = useState<'campaigns' | 'members' | 'settings'>('campaigns');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);

  // Form states (Create Org)
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgType, setOrgType] = useState('NGO');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgLogoUrl, setOrgLogoUrl] = useState('');
  const [submittingOrg, setSubmittingOrg] = useState(false);

  // Form states (Invite Member)
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'FINANCE' | 'VIEWER'>('VIEWER');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Form states (Create/Edit Campaign)
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignTarget, setCampaignTarget] = useState('50000');
  const [campaignStatus, setCampaignStatus] = useState('ACTIVE');
  const [editingCampaign, setEditingCampaign] = useState<OrgCampaign | null>(null);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dashboard profiles
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
        console.error('Error loading profile context');
      }
    };
    fetchProfile();
  }, [token, router, mounted]);

  // Fetch user organizations list
  const fetchOrgs = async (selectIdAfter?: string) => {
    if (!token) return;
    setLoadingOrgs(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrgs(res.data);
      
      // Auto-select or refresh current selection
      const currentId = selectIdAfter || selectedOrg?.id;
      if (currentId) {
        const updatedSelected = res.data.find((item: any) => item.organization.id === currentId);
        if (updatedSelected) {
          await fetchOrgDetails(currentId);
        } else {
          setSelectedOrg(null);
        }
      } else if (res.data.length > 0 && !selectedOrg) {
        await fetchOrgDetails(res.data[0].organization.id);
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load organization accounts', 'error');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const fetchOrgDetails = async (orgId: string) => {
    if (!token) return;
    setLoadingDetails(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrg(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to load organization details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (mounted && token) {
      fetchOrgs();
    }
  }, [mounted, token]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !orgName.trim() || !orgSlug.trim()) return;

    setSubmittingOrg(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/organizations`,
        {
          name: orgName,
          slug: orgSlug.toLowerCase(),
          type: orgType,
          description: orgDescription || null,
          logoUrl: orgLogoUrl || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Organization created successfully!', 'success');
      setCreateModalOpen(false);
      
      // Reset fields
      setOrgName('');
      setOrgSlug('');
      setOrgDescription('');
      setOrgLogoUrl('');
      
      // Refresh list and select the new org
      await fetchOrgs(res.data.id);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to create organization', 'error');
    } finally {
      setSubmittingOrg(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedOrg || !inviteEmail.trim()) return;

    setSubmittingInvite(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/organizations/${selectedOrg.id}/members`,
        { email: inviteEmail, role: inviteRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Member added successfully!', 'success');
      setInviteEmail('');
      setInviteModalOpen(false);
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to add member', 'error');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!token || !selectedOrg || !confirm('Are you sure you want to remove this member?')) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/organizations/${selectedOrg.id}/members/${targetUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Member removed successfully', 'success');
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to remove member', 'error');
    }
  };

  const handleUpdateMemberRole = async (targetUserId: string, newRole: string) => {
    if (!token || !selectedOrg) return;
    try {
      await axios.patch(
        `${BACKEND_URL}/api/organizations/${selectedOrg.id}/members/${targetUserId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Member role updated', 'success');
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update member role', 'error');
    }
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedOrg || !campaignTitle.trim()) return;

    setSubmittingCampaign(true);
    const payload = {
      title: campaignTitle,
      description: campaignDesc || null,
      targetAmount: Number(campaignTarget),
      status: campaignStatus
    };

    try {
      if (editingCampaign) {
        await axios.patch(
          `${BACKEND_URL}/api/organizations/${selectedOrg.id}/campaigns/${editingCampaign.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToast('Campaign updated successfully!', 'success');
      } else {
        await axios.post(
          `${BACKEND_URL}/api/organizations/${selectedOrg.id}/campaigns`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToast('Campaign created successfully!', 'success');
      }
      setCampaignModalOpen(false);
      setEditingCampaign(null);
      setCampaignTitle('');
      setCampaignDesc('');
      setCampaignTarget('50000');
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to save campaign', 'error');
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handleEditCampaignClick = (campaign: OrgCampaign) => {
    setEditingCampaign(campaign);
    setCampaignTitle(campaign.title);
    setCampaignDesc(campaign.description || '');
    setCampaignTarget(Number(campaign.targetAmount).toString());
    setCampaignStatus(campaign.status);
    setCampaignModalOpen(true);
  };

  const handleUpdateOrgDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedOrg) return;

    try {
      await axios.patch(
        `${BACKEND_URL}/api/organizations/${selectedOrg.id}`,
        {
          name: selectedOrg.name,
          slug: selectedOrg.slug,
          description: selectedOrg.description,
          logoUrl: selectedOrg.logoUrl,
          type: selectedOrg.type
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Organization settings updated successfully', 'success');
      fetchOrgs(selectedOrg.id);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update settings', 'error');
    }
  };

  // Check roles of current user
  const currentMemberRecord = selectedOrg?.members.find((m) => m.userId === profileData?.profile?.userId);
  const userRole = currentMemberRecord?.role || 'VIEWER';
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
  const isOwnerAdminOrFinance = isOwnerOrAdmin || userRole === 'FINANCE';

  if (!profileData && loadingOrgs) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light">Loading Organization Portal...</div>;
  }

  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chai.nexoracreatives.co.ke';

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
            {/* Header info */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Organizations</h1>
                <p className="text-brand-muted font-medium text-sm md:text-base">Manage multi-admin group profiles, collect campaign donations, and manage roles.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#914D00] hover:bg-[#7D4200] text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-brand-primary/10 w-full sm:w-auto justify-center"
              >
                <Plus size={16} /> Create Organization
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column: Organization List */}
              <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-6 card-shadow border border-black/[0.02] flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-widest px-2">Your Organizations</h3>
                
                {loadingOrgs ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-14 bg-zinc-50 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : orgs.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 font-semibold text-xs leading-relaxed">
                    You are not a member of any organizations yet. Click "Create Organization" to get started!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orgs.map((item) => {
                      const org = item.organization;
                      const isActive = selectedOrg?.id === org.id;
                      return (
                        <button
                          key={org.id}
                          onClick={() => fetchOrgDetails(org.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                            isActive
                              ? 'bg-[#914D00]/5 border-[#914D00] text-[#914D00]'
                              : 'bg-zinc-50/50 border-black/5 hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-[#914D00] text-white' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            <Building size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate text-zinc-950">{org.name}</p>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">{item.role}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Details & Management Hub */}
              <div className="lg:col-span-3">
                {loadingDetails ? (
                  <div className="bg-white rounded-[2.5rem] p-12 card-shadow border border-black/[0.02] text-center min-h-[500px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#914D00]" size={36} />
                      <p className="text-zinc-500 font-bold text-sm">Loading details...</p>
                    </div>
                  </div>
                ) : !selectedOrg ? (
                  <div className="bg-white rounded-[2.5rem] p-12 card-shadow border border-black/[0.02] text-center min-h-[500px] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 text-zinc-400">
                      <Building size={28} />
                    </div>
                    <h3 className="font-bold text-xl mb-1 text-zinc-950">Select an Organization</h3>
                    <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">Choose an organization from the left sidebar or create a new one to manage campaigns and memberships.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2.5rem] p-6 md:p-8 card-shadow border border-black/[0.02] min-h-[500px] space-y-8">
                    {/* Org profile details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-black/5 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-500 shrink-0">
                          {selectedOrg.logoUrl ? (
                            <img src={selectedOrg.logoUrl} alt={selectedOrg.name} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <Building size={24} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-950">{selectedOrg.name}</h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-100">
                              {selectedOrg.type}
                            </span>
                            {selectedOrg.verified && (
                              <CheckCircle size={14} className="text-green-500" />
                            )}
                          </div>
                          <p className="text-zinc-400 text-xs font-semibold mt-1 font-mono">slug: {selectedOrg.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 rounded-xl border border-black/5">
                        <Shield size={12} className="text-[#914D00]" />
                        <span className="text-[10px] font-bold text-[#914D00] uppercase tracking-wider">Role: {userRole}</span>
                      </div>
                    </div>

                    {/* Section tabs */}
                    <div className="flex border-b border-black/5 gap-6">
                      <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
                          activeTab === 'campaigns' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        Campaigns
                      </button>
                      <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
                          activeTab === 'members' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        Members ({selectedOrg.members.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
                          activeTab === 'settings' ? 'border-[#914D00] text-[#914D00]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        Settings
                      </button>
                    </div>

                    {/* Tab 1: Campaigns */}
                    {activeTab === 'campaigns' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-base text-zinc-950">Active Fundraising Campaigns</h4>
                            <p className="text-xs text-zinc-400 font-medium">Create campaign cards to raise funds jointly for your causes.</p>
                          </div>
                          {isOwnerAdminOrFinance && (
                            <button
                              onClick={() => {
                                setEditingCampaign(null);
                                setCampaignTitle('');
                                setCampaignDesc('');
                                setCampaignTarget('50000');
                                setCampaignStatus('ACTIVE');
                                setCampaignModalOpen(true);
                              }}
                              className="px-4 py-2.5 bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1 border border-black/5"
                            >
                              <Plus size={12} /> New Campaign
                            </button>
                          )}
                        </div>

                        {selectedOrg.campaigns.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-3xl flex flex-col items-center">
                            <Megaphone size={32} className="text-zinc-300 mb-3" />
                            <p className="text-zinc-400 font-semibold text-xs">No fundraising campaigns launched yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedOrg.campaigns.map((c) => {
                              const targetVal = Number(c.targetAmount);
                              const currentVal = Number(c.currentAmount);
                              const progressPct = Math.min(100, Math.round((currentVal / targetVal) * 100)) || 0;
                              
                              return (
                                <div key={c.id} className="border border-black/5 rounded-3xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between bg-zinc-50/20">
                                  <div>
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                      <h5 className="font-bold text-sm text-zinc-950 truncate" title={c.title}>{c.title}</h5>
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                        c.status === 'ACTIVE'
                                          ? 'bg-green-50 text-green-700 border border-green-100'
                                          : 'bg-zinc-100 text-zinc-500'
                                      }`}>
                                        {c.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-medium line-clamp-2 mb-4 leading-relaxed">{c.description || 'No description provided.'}</p>
                                    
                                    {/* Progress stats */}
                                    <div className="space-y-1.5 mb-4">
                                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-zinc-400">Progress</span>
                                        <span className="text-zinc-800">{progressPct}%</span>
                                      </div>
                                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPct}%` }} />
                                      </div>
                                      <div className="flex justify-between text-xs font-semibold pt-1">
                                        <span className="text-green-600">KES {currentVal.toLocaleString()}</span>
                                        <span className="text-zinc-400">Target KES {targetVal.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-3">
                                    <div className="flex gap-2">
                                      {isOwnerAdminOrFinance && (
                                        <button
                                          onClick={() => handleEditCampaignClick(c)}
                                          className="p-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg transition-colors"
                                          title="Edit Campaign"
                                        >
                                          <Edit3 size={12} />
                                        </button>
                                      )}
                                    </div>
                                    
                                    {c.status === 'ACTIVE' && (
                                      <a
                                        href={`${frontendUrl}/campaigns/${c.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-bold uppercase tracking-widest text-[#914D00] hover:underline flex items-center gap-1"
                                      >
                                        Share Link
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Members */}
                    {activeTab === 'members' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-base text-zinc-950">Team & Multi-Admins</h4>
                            <p className="text-xs text-zinc-400 font-medium">Add members to delegate campaign management and financial audits.</p>
                          </div>
                          {isOwnerOrAdmin && (
                            <button
                              onClick={() => {
                                setInviteEmail('');
                                setInviteRole('VIEWER');
                                setInviteModalOpen(true);
                              }}
                              className="px-4 py-2.5 bg-brand-beige-light hover:bg-[#914D00]/10 text-brand-primary text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1 border border-black/5"
                            >
                              <UserPlus size={12} /> Invite Member
                            </button>
                          )}
                        </div>

                        {/* List members table */}
                        <div className="border border-black/5 rounded-3xl overflow-hidden bg-zinc-50/10">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-black/5">
                                <th className="p-4">User</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                {isOwnerOrAdmin && <th className="p-4 text-right">Actions</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 font-semibold text-zinc-800">
                              {selectedOrg.members.map((m) => {
                                const isOwner = m.role === 'OWNER';
                                const displayName = m.user.profile?.displayName || 'Chai User';
                                const username = m.user.profile?.username || 'user';
                                const canModifyThisMember = isOwnerOrAdmin && !isOwner && m.userId !== profileData?.profile?.userId;

                                return (
                                  <tr key={m.id} className="hover:bg-zinc-50/50">
                                    <td className="p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-black/5">
                                          {m.user.profile?.avatarUrl ? (
                                            <img src={m.user.profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                          ) : (
                                            <Users size={14} className="text-zinc-400" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-bold text-zinc-950">{displayName}</p>
                                          <span className="text-[9px] text-zinc-400 font-mono">@{username}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4 font-normal text-zinc-500">{m.user.email}</td>
                                    <td className="p-4">
                                      {canModifyThisMember ? (
                                        <select
                                          value={m.role}
                                          onChange={(e) => handleUpdateMemberRole(m.userId, e.target.value)}
                                          className="bg-white border border-zinc-200 px-2.5 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
                                        >
                                          <option value="ADMIN">ADMIN</option>
                                          <option value="FINANCE">FINANCE</option>
                                          <option value="VIEWER">VIEWER</option>
                                        </select>
                                      ) : (
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                                          isOwner
                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                        }`}>
                                          {m.role}
                                        </span>
                                      )}
                                    </td>
                                    {isOwnerOrAdmin && (
                                      <td className="p-4 text-right">
                                        {canModifyThisMember && (
                                          <button
                                            onClick={() => handleRemoveMember(m.userId)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove team member"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Settings */}
                    {activeTab === 'settings' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-base text-zinc-950">Organization Profile Settings</h4>
                          <p className="text-xs text-zinc-400 font-medium">Update branding elements, logo URL, and descriptions.</p>
                        </div>

                        <form onSubmit={handleUpdateOrgDetails} className="space-y-5 max-w-xl">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Organization Name</label>
                            <input
                              type="text"
                              required
                              disabled={!isOwnerOrAdmin}
                              value={selectedOrg.name}
                              onChange={(e) => setSelectedOrg({ ...selectedOrg, name: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Organization Slug (unique)</label>
                            <input
                              type="text"
                              required
                              disabled={!isOwnerOrAdmin}
                              value={selectedOrg.slug}
                              onChange={(e) => setSelectedOrg({ ...selectedOrg, slug: e.target.value.toLowerCase() })}
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description Cause / Mandate</label>
                            <textarea
                              disabled={!isOwnerOrAdmin}
                              value={selectedOrg.description || ''}
                              onChange={(e) => setSelectedOrg({ ...selectedOrg, description: e.target.value })}
                              rows={3}
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none disabled:opacity-60"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Logo URL</label>
                            <input
                              type="text"
                              disabled={!isOwnerOrAdmin}
                              value={selectedOrg.logoUrl || ''}
                              onChange={(e) => setSelectedOrg({ ...selectedOrg, logoUrl: e.target.value })}
                              placeholder="https://example.com/logo.png"
                              className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                            />
                          </div>

                          {isOwnerOrAdmin && (
                            <button
                              type="submit"
                              className="bg-[#914D00] hover:bg-[#7D4200] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-brand-primary/5"
                            >
                              Update Details
                            </button>
                          )}
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Modal 1: Create Organization */}
        <AnimatePresence>
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setCreateModalOpen(false)} className="absolute inset-0 bg-black" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 card-shadow z-10 text-gray-900">
                <div className="flex justify-between items-center pb-4 border-b border-black/5">
                  <h2 className="font-bold text-lg tracking-tight">Create Organization Hub</h2>
                  <button onClick={() => setCreateModalOpen(false)} className="p-2 hover:bg-black/5 rounded-xl text-zinc-400 hover:text-black transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateOrg} className="py-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Organization Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        // Auto-slugify
                        setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }}
                      placeholder="e.g. St. Peters Church, Mathare Arts Group"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Slug Handle (lowercase, no spaces)</label>
                    <input
                      type="text"
                      required
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
                      placeholder="e.g. mathare-arts"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Organization Type</label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none"
                    >
                      <option value="NGO">NGO (Non-Profit Cause)</option>
                      <option value="CHURCH">CHURCH (Religious cause)</option>
                      <option value="CLUB">CLUB (Social groups)</option>
                      <option value="COMMUNITY">COMMUNITY (Locality cause)</option>
                      <option value="SCHOOL_GROUP">SCHOOL GROUP</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Cause Description</label>
                    <textarea
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      placeholder="Brief description of the organization's goals or mission..."
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Logo URL (Optional)</label>
                    <input
                      type="text"
                      value={orgLogoUrl}
                      onChange={(e) => setOrgLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                    />
                  </div>

                  <div className="border-t border-black/5 pt-5 flex gap-3 justify-end">
                    <button type="button" onClick={() => setCreateModalOpen(false)} className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest">
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingOrg} className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                      {submittingOrg ? 'Creating...' : 'Create Org'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 2: Invite Member */}
        <AnimatePresence>
          {inviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setInviteModalOpen(false)} className="absolute inset-0 bg-black" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 card-shadow z-10 text-gray-900">
                <div className="flex justify-between items-center pb-4 border-b border-black/5">
                  <h2 className="font-bold text-lg tracking-tight">Invite Multi-Admin Member</h2>
                  <button onClick={() => setInviteModalOpen(false)} className="p-2 hover:bg-black/5 rounded-xl text-zinc-400 hover:text-black transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleInviteMember} className="py-6 space-y-4">
                  <div className="p-3 bg-amber-500/5 text-amber-800 border border-amber-500/10 rounded-xl text-[10px] font-semibold leading-relaxed flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>Members must already have a registered Nexora Chai account to be added. If they aren't registered, tell them to sign up first.</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">User Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g. member@email.com"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Permission Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none"
                    >
                      <option value="ADMIN">ADMIN (Full edit & invite rights)</option>
                      <option value="FINANCE">FINANCE (Manage campaigns & payouts)</option>
                      <option value="VIEWER">VIEWER (Read-only dashboards)</option>
                    </select>
                  </div>

                  <div className="border-t border-black/5 pt-5 flex gap-3 justify-end">
                    <button type="button" onClick={() => setInviteModalOpen(false)} className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest">
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingInvite} className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                      {submittingInvite ? 'Adding...' : 'Add Team Member'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 3: Create/Edit Campaign */}
        <AnimatePresence>
          {campaignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setCampaignModalOpen(false)} className="absolute inset-0 bg-black" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 card-shadow z-10 text-gray-900">
                <div className="flex justify-between items-center pb-4 border-b border-black/5">
                  <h2 className="font-bold text-lg tracking-tight">
                    {editingCampaign ? 'Edit Campaign Details' : 'Create Organization Campaign'}
                  </h2>
                  <button onClick={() => setCampaignModalOpen(false)} className="p-2 hover:bg-black/5 rounded-xl text-zinc-400 hover:text-black transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCampaignSubmit} className="py-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      placeholder="e.g. mathare music instruments project, church roof repair fundraiser"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description Cause / Goal</label>
                    <textarea
                      value={campaignDesc}
                      onChange={(e) => setCampaignDesc(e.target.value)}
                      placeholder="What is this campaign raising funds for?"
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Target Amount (KES)</label>
                      <input
                        type="number"
                        required
                        min="100"
                        value={campaignTarget}
                        onChange={(e) => setCampaignTarget(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      />
                    </div>
                    {editingCampaign && (
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Fundraiser Status</label>
                        <select
                          value={campaignStatus}
                          onChange={(e) => setCampaignStatus(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold focus:outline-none"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="PAUSED">PAUSED</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-black/5 pt-5 flex gap-3 justify-end">
                    <button type="button" onClick={() => setCampaignModalOpen(false)} className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-widest">
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingCampaign} className="bg-[#914D00] hover:bg-[#7D4200] disabled:bg-zinc-100 disabled:text-zinc-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                      {submittingCampaign ? 'Saving...' : 'Save Campaign'}
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
