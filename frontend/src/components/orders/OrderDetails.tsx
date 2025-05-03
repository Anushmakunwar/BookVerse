'use client';

import React from 'react';
import { useOrder, useCancelOrder } from '@/lib/react-query/hooks/useOrders';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface OrderDetailsProps {
  orderId: number;
}

/**
 * Component to display detailed information about a specific order
 */
const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
  const { data, isLoading, isError } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.success || !data.order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load order details</h3>
        <p className="text-gray-600 mb-4">
          {data?.message || 'There was an error loading the order details. Please try again later.'}
        </p>
        <div className="flex gap-4">
          <Link
            href="/account/orders"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { order } = data;
  const canCancel = !order.isProcessed && !order.isCancelled;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/account/orders"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-2xl font-bold">Order #{order.id}</h2>
        </div>
        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelOrderMutation.isPending}
            className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {cancelOrderMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">Order Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span>{formatDate(order.orderDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span>
                {order.isProcessed && <span className="text-green-600">Processed</span>}
                {order.isCancelled && <span className="text-red-600">Cancelled</span>}
                {!order.isProcessed && !order.isCancelled && <span className="text-yellow-600">Pending</span>}
              </span>
            </div>
            {!order.isProcessed && !order.isCancelled && (
              <div className="flex justify-between">
                <span className="text-gray-600">Claim Code:</span>
                <span className="font-mono font-semibold">{order.claimCode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">Pickup Information</h3>
          <p className="text-gray-600">
            Please visit our store with your <span className="font-semibold">Claim Code</span> to pick up your order.
          </p>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium">Store Address:</h4>
              <p className="text-gray-600">123 Bookstore Lane</p>
              <p className="text-gray-600">Readingville, BK 12345</p>
            </div>
            <div>
              <h4 className="font-medium">Store Hours:</h4>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p className="text-gray-600">Saturday - Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-semibold text-lg">Order Items</h3>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex gap-4">
              <div className="w-20 h-28 relative flex-shrink-0">
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
                <h4 className="font-medium text-lg">{item.bookTitle}</h4>
                <p className="text-gray-600">{item.bookAuthor}</p>
                <div className="mt-2 flex justify-between items-end">
                  <div>
                    <p className="text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
                    <Link
                      href={`/books/${item.bookId}`}
                      className="text-primary hover:underline text-sm mt-2 inline-block"
                    >
                      View Book
                    </Link>
                  </div>
                  <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
              </div>

              {order.discountPercentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({(order.discountPercentage * 100).toFixed(0)}%):</span>
                  <span>-${(order.subtotal * order.discountPercentage).toFixed(2)}</span>
                </div>
              )}

              {order.discountDescription && (
                <div className="text-xs text-gray-500 italic">
                  {order.discountDescription}
                </div>
              )}

              <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
