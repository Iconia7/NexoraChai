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
    subaccount,
    onSuccess, 
    onClose 
  }: {
    key: string;
    email: string;
    amount: number;
    reference: string;
    subaccount?: string;
    onSuccess: (response: any) => void;
    onClose: () => void;
  }) => {
    const handler = window.PaystackPop.setup({
      key,
      email,
      amount,
      ref: reference,
      subaccount,
      bearer: 'subaccount',
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
