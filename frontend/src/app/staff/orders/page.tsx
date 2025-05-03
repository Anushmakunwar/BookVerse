'use client';

import React from 'react';
import OrderProcessor from '@/components/staff/OrderProcessor';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import StaffLayout from '@/components/layout/StaffLayout';

/**
 * Page for staff to process orders
 */
export default function StaffOrdersPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use a React state to track client-side initialization
  const [isClient, setIsClient] = React.useState(false);

  // Use useEffect to set isClient to true after component mounts
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if there's a stored user in localStorage to prevent unnecessary redirects during page refresh
  const storedUser = isClient ? localStorage.getItem('bookstore_user') : null;
  const hasStoredUser = !!storedUser;

  // Only redirect if we're sure the user is not authenticated (not loading and no stored user)
  if (!isLoading && !isAuthenticated && !hasStoredUser) {
    console.log('User not authenticated, redirecting to login');
    router.push('/login?redirect=/staff/orders');
    return null;
  }

  // Check if user has staff or admin role
  const isStaffOrAdmin = user?.role === 'Staff' || user?.role === 'Admin';

  // Only redirect if we're sure the user doesn't have the right role (not loading and authenticated)
  if (!isLoading && isAuthenticated && !isStaffOrAdmin) {
    console.log('User does not have staff or admin role, redirecting to home');
    router.push('/');
    return null;
  }

  return (
    <StaffLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Process Orders</h1>
        <OrderProcessor />
      </div>
    </StaffLayout>
  );
}
