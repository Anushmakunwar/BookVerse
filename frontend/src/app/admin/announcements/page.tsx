'use client';

import React from 'react';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

/**
 * Page for admin to manage announcements
 */
export default function AdminAnnouncementsPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-8">Manage Announcements</h1>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <AnnouncementManager />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
