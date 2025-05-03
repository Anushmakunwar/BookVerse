'use client';

import React from 'react';
import OrderDetails from '@/components/orders/OrderDetails';
import { useAuth } from '@/lib/hooks/useAuth';
import { redirect } from 'next/navigation';

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Page for displaying details of a specific order
 */
export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = React.use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const orderId = parseInt(resolvedParams.id);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    redirect(`/login?redirect=/account/orders/${resolvedParams.id}`);
  }

  // Validate order ID
  if (isNaN(orderId)) {
    redirect('/account/orders');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <OrderDetails orderId={orderId} />
    </div>
  );
}
