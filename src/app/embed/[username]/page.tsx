'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Coffee, Loader2 } from 'lucide-react';
import CheckoutModal from '@/components/CheckoutModal';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function EmbedCheckout() {
  const { username } = useParams();
  const searchParams = useSearchParams();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Allow pre-filling from URL params for the React Component / Widget
  const amount = Number(searchParams.get('amount')) || 100;
  const message = searchParams.get('message') || '';
  const fanName = searchParams.get('name') || '';

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/creators/${username}`);
        setCreator(res.data);
      } catch (err) {
        console.error('Embed: Creator not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [username]);

  const handleClose = () => {
    // Tell the parent window (the blog/website) to close the iframe
    window.parent.postMessage('close-chai-widget', '*');
    
    // Tell the Flutter App (if running inside one)
    if ((window as any).NexoraChai) {
      (window as any).NexoraChai.postMessage('close-chai-widget');
    }
  };

  const handleSuccess = () => {
    // Tell the parent window (the blog/website) that payment succeeded
    window.parent.postMessage('payment-success', '*');

    // Tell the Flutter App (if running inside one)
    if ((window as any).NexoraChai) {
        (window as any).NexoraChai.postMessage('payment-success');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
    </div>
  );

  if (!creator) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        creator={creator}
        amount={amount}
        message={message}
        fanName={fanName}
      />
    </div>
  );
}
