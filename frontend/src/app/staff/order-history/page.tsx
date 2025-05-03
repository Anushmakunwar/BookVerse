'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAllOrders, useProcessOrder } from '@/lib/react-query/hooks/useOrders';
import { formatDate, extractMemberId } from '@/lib/utils';
import { Loader2, AlertCircle, CheckCircle, XCircle, Filter } from 'lucide-react';
import StaffLayout from '@/components/layout/StaffLayout';
import Image from 'next/image';
import toast from 'react-hot-toast';

/**
 * Staff order history page
 */
export default function StaffOrderHistory() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<boolean | undefined>(undefined);

  const { data: ordersData, isLoading: isLoadingOrders } = useAllOrders(filter);
  const processOrderMutation = useProcessOrder();

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
    router.push('/login?redirect=/staff/order-history');
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Order History</h1>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Filter:</div>
            <select
              value={filter === undefined ? 'all' : filter ? 'processed' : 'pending'}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') setFilter(undefined);
                else if (value === 'processed') setFilter(true);
                else setFilter(false);
              }}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Orders</option>
              <option value="processed">Processed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {isLoadingOrders ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ordersData?.orders && ordersData.orders.length > 0 ? (
          <div className="space-y-4">
            {ordersData.orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg">Order #{order.id}</h3>
                      {order.isProcessed ? (
                        <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Processed
                        </span>
                      ) : order.isCancelled ? (
                        <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                          <XCircle className="h-3 w-3 mr-1" /> Cancelled
                        </span>
                      ) : (
                        <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate || null)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Claim Code: <span className="font-mono">{order.claimCode}</span></p>
                    {!order.isProcessed && !order.isCancelled && (
                      <button
                        onClick={() => {
                          // Process order directly without requiring membership ID
                          processOrderMutation.mutate({
                            claimCode: order.claimCode,
                            membershipId: order.userId || "auto-accept" // Use a fallback value
                          }, {
                            onSuccess: (data) => {
                              if (data.success) {
                                toast.success(`Order #${order.id} accepted successfully!`);
                              }
                            }
                          });
                        }}
                        className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        {processOrderMutation.isPending ?
                          <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> :
                          null
                        }
                        Accept Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-16 h-20 relative">
                          {item.coverImage ? (
                            <Image
                              src={item.coverImage}
                              alt={item.bookTitle}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.bookTitle}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.isProcessed && (
                  <div className="bg-green-50 p-3 border-t border-green-100">
                    <p className="text-sm text-green-700">
                      Processed on {formatDate(order.processedDate || null)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500">
              {filter === undefined
                ? "There are no orders in the system yet."
                : filter
                ? "There are no processed orders."
                : "There are no pending orders."}
            </p>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
