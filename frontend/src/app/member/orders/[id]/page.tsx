'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderDetails from '@/components/orders/OrderDetails';
import { useIsAuthenticated } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';
import { FaSpinner } from 'react-icons/fa';

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
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  const orderId = parseInt(resolvedParams.id);

  // Check authentication on page load and when auth state changes
  useEffect(() => {
    // Set a short timeout to allow the auth state to be checked
    const timer = setTimeout(() => {
      setIsLoading(false);

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(`/member/orders/${resolvedParams.id}`);
        router.replace(`${routes.auth.login}?redirect=${returnUrl}`);
        return;
      }

      // Validate order ID
      if (isNaN(orderId)) {
        router.replace(routes.member.orders);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, orderId, resolvedParams.id, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <FaSpinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (!isAuthenticated || isNaN(orderId)) {
    return null;
  }

  // Render the order details for authenticated users
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <OrderDetails orderId={orderId} />
    </div>
  );
}
