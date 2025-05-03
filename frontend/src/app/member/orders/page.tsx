'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderHistory from '@/components/orders/OrderHistory';
import { useIsAuthenticated } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';
import { FaSpinner } from 'react-icons/fa';

/**
 * Page for displaying user's order history
 */
export default function MemberOrdersPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication on page load and when auth state changes
  useEffect(() => {
    // Set a short timeout to allow the auth state to be checked
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent('/member/orders');
        router.replace(`${routes.auth.login}?redirect=${returnUrl}`);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);
  
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
  if (!isAuthenticated) {
    return null;
  }
  
  // Render the order history for authenticated users
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <OrderHistory />
    </div>
  );
}
