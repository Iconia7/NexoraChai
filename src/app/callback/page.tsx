'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { useToastStore } from '@/lib/toastStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const addToast = useToastStore((state) => state.addToast);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const savedState = localStorage.getItem('nexora_auth_state');

        if (!code || !state) {
            setError('Authentication failed: Missing parameters');
            return;
        }

        if (state !== savedState) {
            setError('Authentication failed: Invalid state');
            return;
        }

        const handleCallback = async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/auth/nexora-id/callback`, { 
                    code,
                    redirect_uri: `${window.location.origin}/callback`
                });

                setAuth(res.data.user, res.data.token);
                addToast('Login successful with Nexora ID!', 'success');
                localStorage.removeItem('nexora_auth_state');
                router.push('/dashboard');
            } catch (err: any) {
                console.error('Callback error:', err);
                setError(err.response?.data?.error || 'Failed to complete authentication');
            }
        };

        handleCallback();
    }, [searchParams, router, setAuth, addToast]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-8">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <div className="w-10 h-10 text-red-500 text-4xl font-bold">!</div>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Auth Error</h1>
                    <p className="text-brand-muted font-bold mb-8">{error}</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="btn-primary py-4 px-8 font-bold bg-black"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige space-y-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-8 border-brand-primary/10 rounded-full" />
                <div className="absolute inset-0 border-8 border-brand-primary rounded-full border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Syncing Identity</h2>
                <p className="text-brand-muted font-bold animate-pulse">Establishing secure Nexora handshake...</p>
            </div>
        </div>
    );
}

export default function Callback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-beige space-y-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-8 border-brand-primary/10 rounded-full" />
                    <div className="absolute inset-0 border-8 border-brand-primary rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
