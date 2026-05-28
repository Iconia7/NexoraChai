'use client';

import { useEffect, useState, useCallback } from 'react';
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
    Lock,
    ArrowUpRight,
    ChevronRight,
    ChevronDown,
    X,
    Phone,
    Link,
    Globe,
    Landmark,
    Loader2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileDashboardNav from '@/components/MobileDashboardNav';
import DashboardHeader from '@/components/DashboardHeader';
import { useToastStore } from '@/lib/toastStore';
import Image from 'next/image';

import WithdrawalModal from '@/components/WithdrawalModal';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface PaystackCountry { name: string; iso_code: string; calling_code: string; currency_code: string; }
interface PaystackBank { name: string; code: string; type: string; currency: string; supports_transfer: boolean; }

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
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [twoFactor, setTwoFactor] = useState(false);
    const [newMpesaNumber, setNewMpesaNumber] = useState('');

    // 2FA Setup State
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFactorStep, setTwoFactorStep] = useState<'info' | 'setup' | 'verify' | 'disable'>('info');
    const [qrCode, setQrCode] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [setupLoading, setSetupLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // ── Payout Settings State ──────────────────────────────────────────
    const [countries, setCountries] = useState<PaystackCountry[]>([]);
    const [banks, setBanks] = useState<PaystackBank[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [savingPayout, setSavingPayout] = useState(false);
    const [verifyingAccount, setVerifyingAccount] = useState(false);
    const [verifiedAccountName, setVerifiedAccountName] = useState<string | null>(null);

    const [payoutCountry, setPayoutCountry] = useState('');
    const [payoutBankCode, setPayoutBankCode] = useState('');
    const [payoutBankName, setPayoutBankName] = useState('');
    const [payoutBankType, setPayoutBankType] = useState('');
    const [payoutAccountNumber, setPayoutAccountNumber] = useState('');
    const [paystackSubaccountCode, setPaystackSubaccountCode] = useState('');
    // ──────────────────────────────────────────────────────────────────

    // Social Links State
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [youtube, setYoutube] = useState('');
    const [website, setWebsite] = useState('');
    const [savingSocials, setSavingSocials] = useState(false);

    const categories = [
        'Digital Artist', 'Software Developer', 'Content Creator',
        'Musician', 'Writer', 'Podcaster', 'Video Producer', 'Gaming'
    ];

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!token) { router.push('/login'); return; }

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
                // Restore existing payout settings
                setPayoutCountry(res.data.profile?.payoutCountry || '');
                setPayoutBankCode(res.data.profile?.payoutBankCode || '');
                setPayoutBankName(res.data.profile?.payoutBankName || '');
                setPayoutAccountNumber(res.data.profile?.payoutAccountNumber || '');
                setPaystackSubaccountCode(res.data.profile?.paystackSubaccountCode || '');
                // Restore social links
                try {
                    const links = res.data.profile?.socialLinks ? JSON.parse(res.data.profile.socialLinks) : {};
                    setTwitter(links.twitter || '');
                    setInstagram(links.instagram || '');
                    setYoutube(links.youtube || '');
                    setWebsite(links.website || '');
                } catch {
                    // fail silently
                }
            } catch (err: any) {
                addToast("Error loading settings. Please try again.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, router, mounted]);

    // Load countries once
    useEffect(() => {
        const loadCountries = async () => {
            setLoadingCountries(true);
            try {
                const res = await axios.get(`${BACKEND_URL}/api/payments/countries`);
                setCountries(res.data.data || []);
            } catch {
                // silently fail — user can still type manually
            } finally {
                setLoadingCountries(false);
            }
        };
        loadCountries();
    }, []);

    // Load banks when country changes
    const loadBanks = useCallback(async (country: string) => {
        if (!country) { setBanks([]); return; }
        setLoadingBanks(true);
        setPayoutBankCode('');
        setPayoutBankName('');
        setPayoutBankType('');
        setVerifiedAccountName(null);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/payments/banks?country=${country}`);
            setBanks(res.data.data || []);
        } catch {
            addToast('Could not load banks for this country', 'error');
        } finally {
            setLoadingBanks(false);
        }
    }, [addToast]);

    useEffect(() => {
        if (payoutCountry) loadBanks(payoutCountry);
    }, [payoutCountry, loadBanks]);

    // Verify bank account (only for traditional banks, not mobile money)
    const handleVerifyAccount = async () => {
        if (!payoutAccountNumber || !payoutBankCode) return;
        setVerifyingAccount(true);
        try {
            const res = await axios.get(
                `${BACKEND_URL}/api/payments/resolve-account?account_number=${payoutAccountNumber}&bank_code=${payoutBankCode}`
            );
            setVerifiedAccountName(res.data.data?.account_name || null);
            addToast(`Account verified: ${res.data.data?.account_name}`, 'success');
        } catch (err: any) {
            setVerifiedAccountName(null);
            addToast(err.response?.data?.error || 'Account verification failed', 'error');
        } finally {
            setVerifyingAccount(false);
        }
    };

    const handleSavePayoutSettings = async () => {
        if (!payoutCountry || !payoutBankCode || !payoutAccountNumber) {
            addToast('Please fill in all payout fields', 'error');
            return;
        }
        setSavingPayout(true);
        try {
            const res = await axios.put(`${BACKEND_URL}/api/creators/payout-settings`, {
                payoutCountry,
                payoutBankCode,
                payoutBankName,
                payoutAccountNumber,
                bankType: payoutBankType
            }, { headers: { Authorization: `Bearer ${token}` } });

            setPaystackSubaccountCode(res.data.paystackSubaccountCode || '');
            if (res.data.verifiedAccountName) setVerifiedAccountName(res.data.verifiedAccountName);
            addToast('Payout settings saved successfully!', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to save payout settings', 'error');
        } finally {
            setSavingPayout(false);
        }
    };

    const handleRefreshAvatar = () => {
        const newSeed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/creators/upload-avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            setAvatarUrl(res.data.avatarUrl);
            addToast("Avatar uploaded!", "success");
        } catch {
            addToast("Failed to upload avatar", "error");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.patch(`${BACKEND_URL}/api/creators/profile`, { displayName, bio, category, avatarUrl }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast("Profile updated successfully", "success");
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSocials = async () => {
        setSavingSocials(true);
        try {
            await axios.patch(`${BACKEND_URL}/api/creators/profile`, {
                displayName,
                bio,
                category,
                avatarUrl,
                socialLinks: JSON.stringify({ twitter, instagram, youtube, website })
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast("Social links updated successfully", "success");
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to update social links", "error");
        } finally {
            setSavingSocials(false);
        }
    };

    const initiate2FASetup = async () => {
        setSetupLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/2fa/setup`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setQrCode(res.data.qrCodeUrl);
            setTwoFactorStep('setup');
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to initiate 2FA setup", "error");
        } finally {
            setSetupLoading(false);
        }
    };

    const verifyAndEnable2FA = async () => {
        setSetupLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/api/auth/2fa/enable`, { code: twoFactorCode }, { headers: { Authorization: `Bearer ${token}` } });
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
            await axios.post(`${BACKEND_URL}/api/auth/2fa/disable`, { code: twoFactorCode }, { headers: { Authorization: `Bearer ${token}` } });
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

    const handleChangePassword = async () => {
        if (!currentPassword) { addToast("Please enter your current password", "error"); return; }
        if (newPassword.length < 6) { addToast("New password must be at least 6 characters", "error"); return; }
        try {
            await axios.post(`${BACKEND_URL}/api/creators/change-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
            addToast("Password changed successfully", "success");
            setShowPasswordModal(false);
            setCurrentPassword(''); setNewPassword('');
        } catch (err: any) {
            addToast(err.response?.data?.error || "Failed to change password", "error");
        }
    };

    const isMobileMoney = payoutBankType?.startsWith('mobile_money') || payoutBankType === 'ghipss';
    const accountLabel = isMobileMoney ? 'Phone Number / Mobile Money Number' : 'Account Number';
    const accountPlaceholder = isMobileMoney ? 'e.g. 0712345678' : 'e.g. 0123456789';
    const canVerify = !isMobileMoney && payoutAccountNumber.length >= 8 && payoutBankCode;

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light font-bold uppercase tracking-widest text-brand-muted">Loading Settings...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-brand-beige-light text-brand-muted font-bold">Error loading settings</div>;

    return (
        <div className="h-screen bg-brand-beige-light flex font-sans overflow-hidden">
            <DashboardSidebar displayName={displayName} username={username} avatarUrl={avatarUrl} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                <MobileDashboardNav onOpenSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-8 overflow-y-auto">
                    <DashboardHeader />

                    <header className="mb-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
                        <p className="text-brand-muted font-medium">Manage your creator profile and security preferences.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                        {/* Left: Profile + Payout Settings */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Public Profile */}
                            <section className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary"><User size={18} /></div>
                                    <h2 className="text-xl font-bold tracking-tight">Public Profile</h2>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-8">
                                    <div className="flex items-center gap-8 mb-10">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-beige ring-4 ring-white shadow-xl relative">
                                                {avatarUrl && <Image src={avatarUrl} alt="Avatar" width={96} height={96} unoptimized className="object-cover" />}
                                                {uploadingAvatar && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCcw className="animate-spin text-white" size={24} /></div>)}
                                            </div>
                                            <button type="button" onClick={() => document.getElementById('avatar-upload')?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Camera size={16} /></button>
                                            <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Profile Photo</h3>
                                            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mb-3">Custom Upload or Generated</p>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => document.getElementById('avatar-upload')?.click()} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/5 px-4 py-2 rounded-full hover:bg-brand-primary/10 transition-colors"><Camera size={12} /> Upload New</button>
                                                <button type="button" onClick={handleRefreshAvatar} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted bg-black/5 px-4 py-2 rounded-full hover:bg-black/10 transition-colors"><RefreshCcw size={12} /> Shuffle</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">Display Name</label>
                                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-base py-4 font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">Creator Category</label>
                                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base py-4 font-bold appearance-none cursor-pointer">
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">Creator Bio</label>
                                        <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell your audience about your work..." className="input-base py-4 font-medium resize-none" />
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <p className="text-[10px] font-bold text-brand-muted leading-relaxed max-w-[250px]">Profile changes are synced in real-time across the platform.</p>
                                        <button type="submit" disabled={saving} className="bg-[#914D00] text-white py-5 px-12 rounded-[2rem] text-sm font-bold uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20">
                                            {saving ? "Saving..." : "Save Profile"} <Save size={18} />
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* ── Payout Settings Panel ───────────────────────── */}
                            <section className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 flex items-center justify-center text-[#00C853]"><Landmark size={18} /></div>
                                    <h2 className="text-xl font-bold tracking-tight">Payout Settings</h2>
                                </div>
                                <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-8 ml-11">Configure where Paystack sends your earnings</p>

                                {paystackSubaccountCode && (
                                    <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-2xl mb-8">
                                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-green-700">Paystack Subaccount Connected</p>
                                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{paystackSubaccountCode}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Country */}
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1 flex items-center gap-2">
                                            <Globe size={12} /> Your Country
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="payout-country"
                                                value={payoutCountry}
                                                onChange={(e) => setPayoutCountry(e.target.value)}
                                                className="input-base py-4 font-bold appearance-none cursor-pointer pr-10"
                                                disabled={loadingCountries}
                                            >
                                                <option value="">{loadingCountries ? 'Loading countries...' : 'Select your country'}</option>
                                                {countries.map(c => (
                                                    <option key={c.iso_code} value={c.iso_code.toLowerCase()}>
                                                        {c.name} ({c.currency_code})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Bank / Payout Method */}
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1 flex items-center gap-2">
                                            <CreditCard size={12} /> Bank / Payout Method
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="payout-bank"
                                                value={payoutBankCode}
                                                onChange={(e) => {
                                                    const selected = banks.find(b => b.code === e.target.value);
                                                    setPayoutBankCode(e.target.value);
                                                    setPayoutBankName(selected?.name || '');
                                                    setPayoutBankType(selected?.type || '');
                                                    setVerifiedAccountName(null);
                                                    setPayoutAccountNumber('');
                                                }}
                                                className="input-base py-4 font-bold appearance-none cursor-pointer pr-10"
                                                disabled={!payoutCountry || loadingBanks}
                                            >
                                                <option value="">
                                                    {!payoutCountry ? 'Select a country first' : loadingBanks ? 'Loading...' : 'Select bank or mobile money'}
                                                </option>
                                                {/* Group: Mobile Money first */}
                                                {banks.filter(b => b.type?.startsWith('mobile_money') || b.type === 'ghipss').length > 0 && (
                                                    <optgroup label="📱 Mobile Money">
                                                        {banks.filter(b => b.type?.startsWith('mobile_money') || b.type === 'ghipss').map(b => (
                                                            <option key={b.code} value={b.code}>{b.name}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                {/* Group: Banks */}
                                                {banks.filter(b => !b.type?.startsWith('mobile_money') && b.type !== 'ghipss').length > 0 && (
                                                    <optgroup label="🏦 Banks">
                                                        {banks.filter(b => !b.type?.startsWith('mobile_money') && b.type !== 'ghipss').map(b => (
                                                            <option key={b.code} value={b.code}>{b.name}</option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                                        </div>
                                        {payoutBankCode && (
                                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-2 ml-1">
                                                {isMobileMoney ? '📱 Mobile Money — verification not required' : '🏦 Bank Account — verification required'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Account Number */}
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">
                                            {accountLabel}
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                id="payout-account"
                                                type="text"
                                                value={payoutAccountNumber}
                                                onChange={(e) => { setPayoutAccountNumber(e.target.value); setVerifiedAccountName(null); }}
                                                placeholder={accountPlaceholder}
                                                className="input-base py-4 font-bold flex-1"
                                                disabled={!payoutBankCode}
                                            />
                                            {canVerify && (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyAccount}
                                                    disabled={verifyingAccount}
                                                    className="px-5 py-4 bg-brand-primary/10 text-brand-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary/20 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2"
                                                >
                                                    {verifyingAccount ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                    Verify
                                                </button>
                                            )}
                                        </div>

                                        {/* Verified account name */}
                                        {verifiedAccountName && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-xl"
                                            >
                                                <CheckCircle2 size={14} className="text-green-500" />
                                                <p className="text-xs font-bold text-green-700">Verified: {verifiedAccountName}</p>
                                            </motion.div>
                                        )}

                                        {/* Warning for bank accounts not yet verified */}
                                        {!isMobileMoney && payoutBankCode && payoutAccountNumber && !verifiedAccountName && (
                                            <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                <p className="text-xs font-bold text-amber-700">Please verify your account before saving</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <div>
                                            <p className="text-[10px] font-bold text-brand-muted">Payout method saved here will be used for your Paystack subaccount.</p>
                                            {payoutBankName && <p className="text-xs font-bold text-brand-secondary mt-1">{payoutBankName} • {payoutAccountNumber}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSavePayoutSettings}
                                            disabled={savingPayout || !payoutCountry || !payoutBankCode || !payoutAccountNumber || (!isMobileMoney && !verifiedAccountName)}
                                            className="bg-[#00C853] text-black py-5 px-10 rounded-[2rem] text-sm font-bold uppercase tracking-widest flex items-center gap-3 disabled:opacity-40 hover:scale-[1.02] transition-all shadow-xl shadow-[#00E676]/20"
                                        >
                                            {savingPayout ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Payout</>}
                                        </button>
                                    </div>
                                </div>
                            </section>
                            {/* ─────────────────────────────────────────────────── */}

                            <section className="bg-white p-10 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary"><LinkIcon size={18} /></div>
                                    <h2 className="text-xl font-bold tracking-tight">Social Links</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Twitter / X</label>
                                        <input 
                                            type="text" 
                                            placeholder="username" 
                                            value={twitter} 
                                            onChange={(e) => setTwitter(e.target.value)} 
                                            className="input-base py-3 font-medium text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Instagram</label>
                                        <input 
                                            type="text" 
                                            placeholder="username" 
                                            value={instagram} 
                                            onChange={(e) => setInstagram(e.target.value)} 
                                            className="input-base py-3 font-medium text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">YouTube</label>
                                        <input 
                                            type="text" 
                                            placeholder="channel" 
                                            value={youtube} 
                                            onChange={(e) => setYoutube(e.target.value)} 
                                            className="input-base py-3 font-medium text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 block ml-1">Website</label>
                                        <input 
                                            type="text" 
                                            placeholder="https://example.com" 
                                            value={website} 
                                            onChange={(e) => setWebsite(e.target.value)} 
                                            className="input-base py-3 font-medium text-sm" 
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 mt-8 border-t border-black/5">
                                    <p className="text-[10px] font-bold text-brand-muted leading-relaxed max-w-[250px]">
                                        Social links will be shown as clickable icons on your public profile page.
                                    </p>
                                    <button 
                                        type="button" 
                                        onClick={handleSaveSocials} 
                                        disabled={savingSocials} 
                                        className="bg-[#914D00] text-white py-4 px-10 rounded-[2rem] text-xs font-bold uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20"
                                    >
                                        {savingSocials ? "Saving..." : "Save Socials"} <Save size={14} />
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Right: Quick Payout Status + Security */}
                        <div className="space-y-8">
                            <section className="bg-white p-8 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 flex items-center justify-center text-[#00C853]"><CreditCard size={18} /></div>
                                    <h2 className="text-lg font-bold tracking-tight">Payout Status</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl bg-brand-beige-light border border-black/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-sm">M-Pesa Withdrawals</p>
                                            <CheckCircle2 size={16} className={mpesaNumber ? "text-green-500" : "text-brand-muted opacity-20"} />
                                        </div>
                                        <p className="text-xs font-bold text-brand-secondary mb-4">{mpesaNumber || 'Not configured'}</p>
                                        <button
                                            onClick={() => setShowPayoutModal(true)}
                                            className="text-brand-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                                        >
                                            Update Payout Account <ArrowUpRight size={12} />
                                        </button>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-brand-beige-light border border-black/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-sm">Paystack Subaccount</p>
                                            {paystackSubaccountCode ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}
                                        </div>
                                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                            {paystackSubaccountCode ? paystackSubaccountCode.slice(0, 20) + '...' : 'Set up payout to connect'}
                                        </p>
                                        {payoutBankName && (
                                            <p className="text-xs font-bold text-brand-secondary mt-1">{payoutBankName}</p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-8 rounded-[3rem] card-shadow border border-black/[0.02]">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary"><Shield size={18} /></div>
                                    <h2 className="text-lg font-bold tracking-tight">Security</h2>
                                </div>
                                <div className="space-y-2">
                                    <button onClick={() => setShowPasswordModal(true)} className="w-full text-left p-4 rounded-2xl hover:bg-black/[0.03] transition-colors group">
                                        <p className="font-bold text-sm group-hover:text-brand-primary transition-colors">Change Password</p>
                                        <p className="text-[10px] font-bold text-brand-muted uppercase">Last changed recently</p>
                                    </button>
                                    <button onClick={() => { setShow2FAModal(true); setTwoFactorStep(twoFactor ? 'disable' : 'info'); }} className="w-full text-left p-4 rounded-2xl hover:bg-black/[0.03] transition-colors group flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm group-hover:text-brand-primary transition-colors">Two-Factor Auth</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${twoFactor ? 'text-green-500' : 'text-brand-muted'}`}>
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
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShow2FAModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 relative z-10 shadow-2xl overflow-hidden">
                                    <button onClick={() => setShow2FAModal(false)} className="absolute top-6 right-6 text-brand-muted hover:text-black"><X size={24} /></button>
                                    {twoFactorStep === 'info' && (
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-8"><Shield size={40} /></div>
                                            <h3 className="text-2xl font-bold tracking-tight mb-4">Protect Your Account</h3>
                                            <p className="text-brand-muted font-medium text-sm leading-relaxed mb-8">Two-factor authentication adds an extra layer of security to your account by requiring a code from your authenticator app.</p>
                                            <button onClick={initiate2FASetup} disabled={setupLoading} className="w-full bg-[#914D00] text-white py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-brand-primary/20">{setupLoading ? "Initializing..." : "Get Started"}</button>
                                        </div>
                                    )}
                                    {twoFactorStep === 'setup' && (
                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight mb-2">Scan QR Code</h3>
                                            <p className="text-brand-muted font-medium text-sm mb-8">Scan this code with Google Authenticator or Authy.</p>
                                            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-inner mb-8 flex justify-center">{qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />}</div>
                                            <button onClick={() => setTwoFactorStep('verify')} className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest">I've Scanned It</button>
                                        </div>
                                    )}
                                    {(twoFactorStep === 'verify' || twoFactorStep === 'disable') && (
                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight mb-2">{twoFactorStep === 'verify' ? 'Verify Setup' : 'Disable 2FA'}</h3>
                                            <p className="text-brand-muted font-medium text-sm mb-8">Enter the 6-digit code from your app.</p>
                                            <input type="text" maxLength={6} value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="000000" className="w-full text-center text-4xl font-bold tracking-[0.5em] py-6 border-2 border-black/5 rounded-2xl mb-8 focus:border-brand-primary outline-none transition-colors" />
                                            <button onClick={twoFactorStep === 'verify' ? verifyAndEnable2FA : handleDisable2FA} disabled={setupLoading || twoFactorCode.length !== 6} className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest ${twoFactorStep === 'verify' ? 'bg-[#914D00] text-white shadow-xl shadow-brand-primary/20' : 'bg-red-500 text-white shadow-xl shadow-red-500/20'} disabled:opacity-50`}>
                                                {setupLoading ? "Verifying..." : twoFactorStep === 'verify' ? "Verify & Enable" : "Disable 2FA"}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Password Modal */}
                    <AnimatePresence>
                        {showPasswordModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 relative z-10 shadow-2xl">
                                    <button onClick={() => setShowPasswordModal(false)} className="absolute top-6 right-6 text-brand-muted hover:text-black"><X size={24} /></button>
                                    <div className="w-16 h-16 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary mb-8"><Lock size={32} /></div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-2">Change Password</h3>
                                    <p className="text-brand-muted font-medium text-sm mb-8">Enter your current password to set a new one.</p>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">Current Password</label>
                                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="input-base py-4 font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">New Password</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="input-base py-4 font-bold" />
                                        </div>
                                        <button onClick={handleChangePassword} className="w-full bg-[#914D00] text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all">Update Password</button>
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
                                    <h3 className="text-2xl font-bold tracking-tight mb-2">Update Payout Details</h3>
                                    <p className="text-brand-muted font-medium text-sm mb-8">Authorized personnel only. Please verify your identity.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">New M-Pesa Number</label>
                                            <input
                                                type="text"
                                                value={newMpesaNumber}
                                                onChange={(e) => setNewMpesaNumber(e.target.value)}
                                                placeholder="+254 --- --- ---"
                                                className="input-base py-4 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 block ml-1">Current Password</label>
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
                                            className="w-full bg-[#00C853] text-black py-5 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-[#00E676]/20 hover:scale-[1.02] transition-all"
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
