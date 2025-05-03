'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaBoxOpen, FaClipboardList } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { routes } from '@/lib/routes';
import { Loader2 } from 'lucide-react';
import StaffLayout from '@/components/layout/StaffLayout';

/**
 * Staff dashboard page
 */
export default function StaffDashboard() {
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
    router.push('/login?redirect=/staff');
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
        <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6 hover:shadow-hover transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-4 rounded-xl mr-4 text-primary">
                <FaBoxOpen className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Process Orders</h3>
                <p className="text-sm text-gray-500">Verify and fulfill customer orders</p>
              </div>
            </div>
            <Link href={routes.staff.orders}>
              <div className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center">
                Go to Order Processing
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6 hover:shadow-hover transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-secondary/10 p-4 rounded-xl mr-4 text-secondary">
                <FaClipboardList className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Order History</h3>
                <p className="text-sm text-gray-500">View processed and pending orders</p>
              </div>
            </div>
            <Link href={routes.staff.orderHistory}>
              <div className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center">
                View Order History
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-bold mb-4">Staff Instructions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h3 className="font-bold text-blue-700">Order Processing</h3>
              <p className="text-sm text-blue-600">
                When a customer arrives to pick up their order, ask for their Membership ID and Claim Code.
                Enter both in the order processing form to verify and complete their order.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <h3 className="font-bold text-yellow-700">Important Note</h3>
              <p className="text-sm text-yellow-600">
                Always verify the customer's identity before processing an order. The system will check that
                the Membership ID matches the order owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
