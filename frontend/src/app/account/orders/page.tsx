'use client';

import React from 'react';
import OrderHistory from '@/components/orders/OrderHistory';
import { useAuth } from '@/lib/hooks/useAuth';
import { redirect } from 'next/navigation';

/**
 * Page for displaying user's order history
 */
export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    redirect('/login?redirect=/account/orders');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      <OrderHistory />
    </div>
  );
}
