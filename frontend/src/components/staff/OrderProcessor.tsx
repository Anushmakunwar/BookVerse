'use client';

import React, { useState } from 'react';
import { useProcessOrder, useAllOrders, ProcessOrderInput } from '@/lib/react-query/hooks/useOrders';
import { formatDate, extractMemberId } from '@/lib/utils';
import { Loader2, AlertCircle, Search, CheckCircle, User, Tag } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Component for staff to process orders
 */
const OrderProcessor: React.FC = () => {
  const [claimCode, setClaimCode] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const queryClient = useQueryClient();
  const processOrderMutation = useProcessOrder();
  const { data: pendingOrdersData } = useAllOrders(false);

  // Log the pending orders data to inspect the structure
  React.useEffect(() => {
    if (pendingOrdersData?.orders?.length > 0) {
      console.log('Pending orders data:', pendingOrdersData.orders[0]);
    }
  }, [pendingOrdersData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimCode.trim()) {
      const input: ProcessOrderInput = {
        claimCode: claimCode.trim(),
        membershipId: "auto-accept" // Use auto-accept to bypass membership ID verification
      };

      processOrderMutation.mutate(input, {
        onSuccess: (data) => {
          if (data.success) {
            // Invalidate all purchase check queries to refresh review permissions
            queryClient.invalidateQueries({
              queryKey: ['reviews', 'purchase']
            });

            toast.success('Order processed successfully! Members can now review purchased books.');
          }
        }
      });
    }
  };

  const handleSuccess = () => {
    setClaimCode('');
    setMembershipId('');
  };

  return (
    <div className="space-y-8">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-semibold text-lg">Process Order</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-4">
              <label htmlFor="claimCode" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Claim Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="claimCode"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. ABC12345"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The claim code from the member's order confirmation email
              </p>
            </div>

            <button
              type="submit"
              disabled={processOrderMutation.isPending || !claimCode.trim()}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processOrderMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
              Accept Order
            </button>
          </form>

          {processOrderMutation.isSuccess && processOrderMutation.data.success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Order Processed Successfully</h4>
                <p className="text-green-700 text-sm mt-1">
                  Order #{processOrderMutation.data.order?.id} has been marked as processed.
                </p>
                <button
                  onClick={handleSuccess}
                  className="mt-2 text-sm text-primary font-medium hover:underline"
                >
                  Process Another Order
                </button>
              </div>
            </div>
          )}

          {processOrderMutation.isError || (processOrderMutation.isSuccess && !processOrderMutation.data.success) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Error Processing Order</h4>
                <p className="text-red-700 text-sm mt-1">
                  {processOrderMutation.data?.message || 'Invalid claim code or order cannot be processed.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Pending Orders</h3>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            {pendingOrdersData?.orders.length || 0} Pending
          </span>
        </div>
        <div className="divide-y">
          {pendingOrdersData?.orders.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No pending orders to display.
            </div>
          )}

          {pendingOrdersData?.orders.map((order) => (
            <div key={order.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">Order #{order.id}</h4>
                  <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate)}</p>
                  <p className="text-sm font-medium mt-1">Claim Code: <span className="font-mono">{order.claimCode}</span></p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                  <div className="flex flex-col space-y-2 mt-1">
                    <button
                      onClick={() => {
                        // Process order directly without requiring membership ID
                        processOrderMutation.mutate({
                          claimCode: order.claimCode,
                          membershipId: order.userId || "auto-accept" // Use a fallback value
                        }, {
                          onSuccess: (data) => {
                            if (data.success) {
                              // Invalidate all purchase check queries to refresh review permissions
                              queryClient.invalidateQueries({
                                queryKey: ['reviews', 'purchase']
                              });

                              toast.success(`Order #${order.id} accepted successfully! Member can now review purchased books.`);
                            } else {
                              toast.error(data.message || 'Failed to process order');
                            }
                          },
                          onError: (error: any) => {
                            toast.error(error.message || 'Failed to process order');
                          }
                        });
                      }}
                      className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-16">
                    <div className="w-16 h-20 relative mb-1">
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
                    <p className="text-xs text-gray-600 truncate">{item.quantity}x</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderProcessor;
