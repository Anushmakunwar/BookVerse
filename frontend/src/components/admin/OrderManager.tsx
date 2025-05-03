'use client';

import React, { useState } from 'react';
import { useAllOrders, useProcessOrder } from '@/lib/react-query/hooks/useOrders';
import { formatDate } from '@/lib/utils';
import { Loader2, AlertCircle, Search, CheckCircle, User, Tag, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Component for admin to manage orders
 */
const OrderManager: React.FC = () => {
  const [filter, setFilter] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const processOrderMutation = useProcessOrder();
  const { data, isLoading, isError, refetch } = useAllOrders(filter);

  const handleProcessOrder = (claimCode: string) => {
    processOrderMutation.mutate(
      {
        claimCode,
        membershipId: 'auto-accept', // Use auto-accept to bypass membership ID verification
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            // Invalidate all purchase check queries to refresh review permissions
            queryClient.invalidateQueries({
              queryKey: ['reviews', 'purchase'],
            });
            // Invalidate orders queries using the correct query key
            queryClient.invalidateQueries({
              queryKey: ['orders'],
            });

            toast.success('Order processed successfully!');
          }
        },
      }
    );
  };

  // Debug data
  console.log('Orders data:', data);
  console.log('Is loading:', isLoading);
  console.log('Is error:', isError);

  // Add effect to log when component mounts and when filter changes
  React.useEffect(() => {
    console.log('OrderManager mounted or filter changed:', filter);

    // Force refetch when component mounts or filter changes
    refetch();
  }, [filter, refetch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Order Management</h2>
          <button
            onClick={() => {
              refetch();
              toast.success('Refreshing orders...');
            }}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Refresh orders"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-6 py-2 rounded-md font-medium ${
              filter === null
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter(false)}
            className={`px-6 py-2 rounded-md font-medium ${
              filter === false
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter(true)}
            className={`px-6 py-2 rounded-md font-medium ${
              filter === true
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Processed
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>There was an error loading the orders. Please try again later.</p>
        </div>
      ) : !data || !data.orders || data.orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.memberName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {order.claimCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.isProcessed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Processed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!order.isProcessed && (
                      <button
                        onClick={() => handleProcessOrder(order.claimCode)}
                        disabled={processOrderMutation.isPending}
                        className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processOrderMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // View order details (to be implemented)
                        toast.info(`View details for order #${order.id}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
