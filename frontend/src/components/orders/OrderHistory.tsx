'use client';

import React from 'react';
import { useOrders, useCancelOrder } from '@/lib/react-query/hooks/useOrders';
import { Order } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Component to display user's order history
 */
const OrderHistory: React.FC = () => {
  const { data, isLoading, isError } = useOrders();
  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = (orderId: number) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load orders</h3>
        <p className="text-gray-600 mb-4">
          {data?.message || 'There was an error loading your order history. Please try again later.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.orders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
        <Link
          href="/books"
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-black font-medium rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Orders</h2>

      {data.orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onCancel={() => handleCancelOrder(order.id)}
          isProcessing={cancelOrderMutation.isPending && cancelOrderMutation.variables === order.id}
        />
      ))}
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onCancel: () => void;
  isProcessing: boolean;
}

/**
 * Component to display a single order
 */
const OrderCard: React.FC<OrderCardProps> = ({ order, onCancel, isProcessing }) => {
  const canCancel = !order.isProcessed && !order.isCancelled;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Order #{order.id}</h3>
            {order.isProcessed && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Processed
              </span>
            )}
            {order.isCancelled && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Cancelled
              </span>
            )}
            {!order.isProcessed && !order.isCancelled && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
          {!order.isProcessed && !order.isCancelled && (
            <div className="text-sm text-gray-500">Claim Code: <span className="font-mono font-semibold">{order.claimCode}</span></div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-20 relative flex-shrink-0">
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
              <div className="flex-1">
                <h4 className="font-medium">{item.bookTitle}</h4>
                <p className="text-sm text-gray-600">{item.bookAuthor}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-sm">${item.price.toFixed(2)} × {item.quantity}</span>
                  <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
        <div>
          <Link
            href={`/account/orders/${order.id}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            View Details
          </Link>
        </div>
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
