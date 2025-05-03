'use client';

import React from 'react';
import OrderManager from '@/components/admin/OrderManager';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

/**
 * Page for admin to manage orders
 */
export default function AdminOrdersPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <OrderManager />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
