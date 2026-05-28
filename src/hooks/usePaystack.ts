'use client';

import { useState } from 'react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);

  const initializePayment = ({ 
    key, 
    email, 
    amount, 
    reference, 
    accessCode,
    currency,
    subaccount,
    onSuccess, 
    onClose 
  }: {
    key: string;
    email: string;
    amount: number;
    reference: string;
    accessCode?: string;
    currency?: string;
    subaccount?: string;
    onSuccess: (response: any) => void;
    onClose: () => void;
  }) => {
    const config = accessCode 
      ? { key, access_code: accessCode }
      : {
          key,
          email,
          amount,
          currency: currency || 'KES',
          ref: reference,
          ...(subaccount ? { subaccount, bearer: 'subaccount' } : {}),
        };

    const handler = window.PaystackPop.setup({
      ...config,
      onClose: () => {
        onClose();
      },
      callback: (response: any) => {
        onSuccess(response);
      },
    });

    handler.openIframe();
  };

  return { initializePayment, loading, setLoading };
};
