'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    User,
    Camera,
    Link as LinkIcon,
    Shield,
    CreditCard,
    Save,
    CheckCircle2,
    XCircle,
    RefreshCcw,
    Sparkles,
    Lock,
    ArrowUpRight,
    ChevronRight,
    X,
    Phone,
    Link
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';
import { useToastStore } from '@/lib/toastStore';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function SettingsPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const addToast = useToastStore((state) => state.addToast);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false);

    // Form State
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState('');
    const [category, setCategory] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Security State
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [newMpesaNumber, setNewMpesaNumber] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [twoFactor, setTwoFactor] = useState(false);

    // 2FA Setup State
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFactorStep, setTwoFactorStep] = useState<'info' | 'setup' | 'verify' | 'disable'>('info');
    const [qrCode, setQrCode] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [setupLoading, setSetupLoading] = useState(false);

    const categories = [
        'Digital Artist',
        'Software Developer',
        'Content Creator',
        'Musician',
        'Writer',
        'Podcaster',
        'Video Producer',
        'Gaming'
    ];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/creators/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
                setDisplayName(res.data.profile?.displayName || '');
                setBio(res.data.profile?.bio || '');
                setUsername(res.data.profile?.username || '');
                setCategory(res.data.profile?.category || 'Content Creator');
                setAvatarUrl(res.data.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.data.profile?.username}`);
                setMpesaNumber(res.data.profile?.mpesaNumber || '');
                setNewMpesaNumber(res.data.profile?.mpesaNumber || '');
                setTwoFactor(res.data.user?.twoFactorEnabled || false);
            } catch (err: any) {
                console.error('Settings fetch failed:', err.response?.data || err.message);
                addToast("Error loading settings. Please try again.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, router]);

    const handleRefreshAvatar = () => {
        const newSeed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.patch(`${BACKEND_URL}/api/creators/profile`, {
                displayName,
                bio,
                category,
                avatarUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast("Profile updated successfully", "success");
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const initiate2FASetup = async () => {
        setSetupLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/2fa/setup`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCode(res.data.qrCodeUrl);
            setTwoFactorStep('setup');
        } catch (err: any) {
            console.error('2FA Init failed:', err);
            addToast(err.response?.data?.error || "Failed to initiate 2FA setup", "error");
        } finally {
            setSetupLoading(false);
        }
    };

    const verifyAndEnable2FA = async () => {
        setSetupLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/api/auth/2fa/enable`, { code: twoFactorCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTwoFactor(true);
            addToast("Two-Factor Authentication enabled!", "success");
            setShow2FAModal(false);
            setTwoFactorCode('');
        } catch (err: any) {
            addToast(err.response?.data?.error || "Invalid verification code", "error");
        } finally {
            setSetupLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setSetupLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/api/auth/2fa/disable`, { code: twoFactorCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTwoFactor(false);
            addToast("Two-Factor Authentication disabled", "info");
            setShow2FAModal(false);
            setTwoFactorCode('');
        } catch (err: any) {
            addToast(err.response?.data?.error || "Invalid verification code", "error");
        } finally {
            setSetupLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword) {
            addToast("Please enter your current password", "error");
            return;
        }
        if (newPassword.length < 6) {
            addToast("New password must be at least 6 characters", "error");
            return;
        }
        try {
            await axios.post(`${BACKEND_URL}/api/creators/change-password`, {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast("Password changed successfully", "success");
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to change password", "error");
        }
    };

    const handleUpdatePayout = async () => {
        if (!currentPassword) {
            addToast("Please enter your password to authorize this change", "error");
            return;
        }
        if (!newMpesaNumber) {
            addToast("Please enter a valid M-Pesa number", "error");
            return;
        }
        try {
            await axios.post(`${BACKEND_URL}/api/creators/payout-number`, {
                currentPassword,
                mpesaNumber: newMpesaNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMpesaNumber(newMpesaNumber);
            addToast("Payout number updated successfully", "success");
            setShowPayoutModal(false);
            setCurrentPassword('');
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to update payout number", "error");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light font-black uppercase tracking-widest text-brand-muted">Loading Settings...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light text-brand-muted font-bold">Error loading settings</div>;

    return (
        <div className="min-h-screen bg-brand-beige-light flex font-sans">
            <DashboardSidebar
                displayName={displayName}
                username={username}
                avatarUrl={avatarUrl}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <MobileDashboardNav onOpenSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-8 overflow-y-auto">
                    <DashboardHeader />

                    <header className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
                        <p className="text-brand-muted font-medium">Manage your creator profile and security preferences.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                        {/* Left: Profile Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <User size={18} />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">Public Profile</h2>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-8">
                                    <div className="flex items-center gap-8 mb-10">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-beige ring-4 ring-white shadow-xl">
                                                <Image src={avatarUrl} alt="Avatar" width={96} height={96} unoptimized />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRefreshAvatar}
                                                className="absolute inset-0 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <RefreshCcw size={24} />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Profile Photo</h3>
                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-3">AI-Style Avatar Generator</p>
                                            <button
                                                type="button"
                                                onClick={handleRefreshAvatar}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 px-4 py-2 rounded-full hover:bg-brand-primary/10 transition-colors"
                                            >
                                                <Sparkles size={12} /> Generate New Look
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">Display Name</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="input-base py-4 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">Creator Category</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="input-base py-4 font-bold appearance-none cursor-pointer"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">Creator Bio</label>
                                        <textarea
                                            rows={4}
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell your audience about your work..."
                                            className="input-base py-4 font-medium resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <p className="text-[10px] font-bold text-brand-muted leading-relaxed max-w-[250px]">
                                            Profile changes are synced in real-time across the platform.
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-[#914D00] text-white py-5 px-12 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20"
                                        >
                                            {saving ? "Saving..." : "Save Profile"} <Save size={18} />
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <LinkIcon size={18} />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">Social Links</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['Twitter', 'Instagram', 'YouTube', 'Website'].map((platform) => (
                                        <div key={platform}>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">{platform}</label>
                                            <input
                                                type="text"
                                                placeholder={`@username`}
                                                className="input-base py-3 font-medium text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right: Security & Integration */}
                        <div className="space-y-8">
                            <section className="bg-white p-8 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 flex items-center justify-center text-[#00C853]">
                                        <CreditCard size={18} />
                                    </div>
                                    <h2 className="text-lg font-black tracking-tight">Payout Settings</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-brand-beige-light border border-black/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-bold text-sm">M-Pesa Number</p>
                                            <CheckCircle2 size={16} className={mpesaNumber ? "text-green-500" : "text-brand-muted opacity-20"} />
                                        </div>
                                        <p className="text-lg font-black text-brand-secondary mb-4">
                                            {mpesaNumber || '+254 --- --- ---'}
                                        </p>
                                        <button
                                            onClick={() => setShowPayoutModal(true)}
                                            className="text-brand-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                                        >
                                            Update Payout Account <ArrowUpRight size={12} />
                                        </button>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-brand-beige-light border border-black/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-bold text-sm">Paystack Split</p>
                                            {data.profile.paystackSubaccountCode ? (
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-brand-muted uppercase mb-4 leading-loose">
                                            ID: {data.profile.paystackSubaccountCode || 'NOT CONFIGURED'}
                                        </p>
                                        <Link
                                            href="/dashboard/setup"
                                            className="text-brand-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                                        >
                                            {data.profile.paystackSubaccountCode ? 'Re-sync Subaccount' : 'Connect Account'} <ChevronRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-8 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                                        <Shield size={18} />
                                    </div>
                                    <h2 className="text-lg font-black tracking-tight">Security</h2>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="w-full text-left p-4 rounded-2xl hover:bg-black/[0.03] transition-colors group"
                                    >
                                        <p className="font-bold text-sm group-hover:text-brand-primary transition-colors">Change Password</p>
                                        <p className="text-[10px] font-bold text-brand-muted uppercase">Last changed recently</p>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShow2FAModal(true);
                                            setTwoFactorStep(twoFactor ? 'disable' : 'info');
                                        }}
                                        className="w-full text-left p-4 rounded-2xl hover:bg-black/[0.03] transition-colors group flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-bold text-sm group-hover:text-brand-primary transition-colors">Two-Factor Auth</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${twoFactor ? 'text-green-500' : 'text-brand-muted'}`}>
                                                {twoFactor ? 'Securely Enabled' : 'Not Protected'}
                                            </p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${twoFactor ? 'bg-green-50/50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                            <Shield size={20} />
                                        </div>
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* 2FA Modal */}
                    <AnimatePresence>
                        {show2FAModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShow2FAModal(false)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white w-full max-w-md rounded-[3rem] p-10 relative z-10 shadow-2xl overflow-hidden"
                                >
                                    <button onClick={() => setShow2FAModal(false)} className="absolute top-6 right-6 text-brand-muted hover:text-black">
                                        <X size={24} />
                                    </button>

                                    {twoFactorStep === 'info' && (
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-8">
                                                <Shield size={40} />
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tight mb-4">Protect Your Account</h3>
                                            <p className="text-brand-muted font-medium text-sm leading-relaxed mb-8">
                                                Two-factor authentication adds an extra layer of security to your account by requiring a code from your authenticator app.
                                            </p>
                                            <button
                                                onClick={initiate2FASetup}
                                                disabled={setupLoading}
                                                className="w-full bg-[#914D00] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20"
                                            >
                                                {setupLoading ? "Initializing..." : "Get Started"}
                                            </button>
                                        </div>
                                    )}

                                    {twoFactorStep === 'setup' && (
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight mb-2">Scan QR Code</h3>
                                            <p className="text-brand-muted font-medium text-sm mb-8">Scan this code with Google Authenticator or Authy.</p>

                                            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-inner mb-8 flex justify-center">
                                                {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />}
                                            </div>

                                            <button
                                                onClick={() => setTwoFactorStep('verify')}
                                                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest"
                                            >
                                                I've Scanned It
                                            </button>
                                        </div>
                                    )}

                                    {(twoFactorStep === 'verify' || twoFactorStep === 'disable') && (
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                                {twoFactorStep === 'verify' ? 'Verify Setup' : 'Disable 2FA'}
                                            </h3>
                                            <p className="text-brand-muted font-medium text-sm mb-8">
                                                Enter the 6-digit code from your app.
                                            </p>

                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                                placeholder="000000"
                                                className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 border-2 border-black/5 rounded-2xl mb-8 focus:border-brand-primary outline-none transition-colors"
                                            />

                                            <button
                                                onClick={twoFactorStep === 'verify' ? verifyAndEnable2FA : handleDisable2FA}
                                                disabled={setupLoading || twoFactorCode.length !== 6}
                                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest ${twoFactorStep === 'verify' ? 'bg-[#914D00] text-white shadow-xl shadow-brand-primary/20' : 'bg-red-500 text-white shadow-xl shadow-red-500/20'} disabled:opacity-50`}
                                            >
                                                {setupLoading ? "Verifying..." : twoFactorStep === 'verify' ? "Verify & Enable" : "Disable 2FA"}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Password Change Modal */}
                    <AnimatePresence>
                        {showPasswordModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white w-full max-w-md rounded-[3rem] p-10 relative z-10 shadow-2xl"
                                >
                                    <button onClick={() => setShowPasswordModal(false)} className="absolute top-6 right-6 text-brand-muted hover:text-black">
                                        <X size={24} />
                                    </button>
                                    <div className="w-16 h-16 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary mb-8">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-2">Change Password</h3>
                                    <p className="text-brand-muted font-medium text-sm mb-8">Enter your current password to set a new one.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="input-base py-4 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="input-base py-4 font-bold"
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            className="w-full bg-[#914D00] text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Payout Modal */}
                    <AnimatePresence>
                        {showPayoutModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => { setShowPayoutModal(false); setCurrentPassword(''); }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white w-full max-w-md rounded-[3rem] p-10 relative z-10 shadow-2xl"
                                >
                                    <button onClick={() => setShowPayoutModal(false)} className="absolute top-6 right-6 text-brand-muted hover:text-black">
                                        <X size={24} />
                                    </button>
                                    <div className="w-16 h-16 bg-[#00E676]/10 rounded-[2rem] flex items-center justify-center text-[#00C853] mb-8">
                                        <Phone size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-2">Update Payout Details</h3>
                                    <p className="text-brand-muted font-medium text-sm mb-8">Authorized personnel only. Please verify your identity.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">New M-Pesa Number</label>
                                            <input
                                                type="text"
                                                value={newMpesaNumber}
                                                onChange={(e) => setNewMpesaNumber(e.target.value)}
                                                placeholder="+254 --- --- ---"
                                                className="input-base py-4 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 block ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="input-base py-4 font-bold"
                                            />
                                        </div>
                                        <button
                                            onClick={handleUpdatePayout}
                                            className="w-full bg-[#00C853] text-black py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[#00E676]/20 hover:scale-[1.02] transition-all"
                                        >
                                            Confirm Payout Number
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
