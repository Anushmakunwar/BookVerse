'use client';

import React from 'react';
import UserManager from '@/components/admin/UserManager';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

/**
 * Page for admin to manage users
 */
export default function AdminUsersPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <UserManager />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
