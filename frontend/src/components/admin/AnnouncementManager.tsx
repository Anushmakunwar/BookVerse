'use client';

import React, { useState } from 'react';
import {
  useAllAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement
} from '@/lib/react-query/hooks/useAnnouncements';
import { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';
import { Loader2, AlertCircle, Plus, Edit, Trash2, Calendar } from 'lucide-react';

/**
 * Component for managing announcements (admin only)
 */
const AnnouncementManager: React.FC = () => {
  const { data, isLoading, isError } = useAllAnnouncements();
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

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
        <h3 className="text-xl font-semibold mb-2">Failed to load announcements</h3>
        <p className="text-gray-600 mb-4">
          {data?.message || 'There was an error loading announcements. Please try again later.'}
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

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Announcements</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-xl shadow-md hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onCancel={handleCancel}
        />
      )}

      {data.announcements.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <h3 className="text-2xl font-semibold mb-3">No Announcements</h3>
          <p className="text-gray-600 mb-6">There are no announcements yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-xl shadow-md hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Your First Announcement
          </button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                      {announcement.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(announcement.startTime)} - {formatDate(announcement.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {announcement.isActive ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {announcement.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <DeleteAnnouncementButton announcementId={announcement.id} />
                    </div>
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

interface AnnouncementFormProps {
  announcement: Announcement | null;
  onCancel: () => void;
}

/**
 * Form for creating or editing announcements
 */
const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ announcement, onCancel }) => {
  const isEditing = !!announcement;

  // Format date for input field (YYYY-MM-DDThh:mm)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [message, setMessage] = useState(announcement?.message || '');
  const [startTime, setStartTime] = useState(
    isEditing ? formatDateForInput(announcement.startTime) : formatDateForInput(new Date().toISOString())
  );
  const [endTime, setEndTime] = useState(
    isEditing
      ? formatDateForInput(announcement.endTime)
      : formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Default to 7 days from now
  );

  const createAnnouncementMutation = useCreateAnnouncement();
  const updateAnnouncementMutation = useUpdateAnnouncement(announcement?.id || 0);

  const isPending = createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      message,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString()
    };

    if (isEditing) {
      updateAnnouncementMutation.mutate(data as UpdateAnnouncementInput, {
        onSuccess: (result) => {
          if (result.success) {
            onCancel();
          }
        }
      });
    } else {
      createAnnouncementMutation.mutate(data as CreateAnnouncementInput, {
        onSuccess: (result) => {
          if (result.success) {
            onCancel();
          }
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 rounded-xl p-8 bg-white shadow-md">
      <h3 className="text-2xl font-semibold mb-6">
        {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
      </h3>

      <div className="space-y-6">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Announcement Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            rows={4}
            required
            maxLength={500}
            placeholder="Enter your announcement message here..."
          />
          <p className="mt-2 text-sm text-gray-500">
            {message.length}/500 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              When the announcement will start showing
            </p>
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              When the announcement will stop showing
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !message.trim() || !startTime || !endTime}
          className="px-6 py-3 bg-primary text-black rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
        >
          {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          {isEditing ? 'Update' : 'Create'} Announcement
        </button>
      </div>
    </form>
  );
};

interface DeleteAnnouncementButtonProps {
  announcementId: number;
}

/**
 * Button for deleting an announcement with confirmation
 */
const DeleteAnnouncementButton: React.FC<DeleteAnnouncementButtonProps> = ({ announcementId }) => {
  const deleteAnnouncementMutation = useDeleteAnnouncement();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      deleteAnnouncementMutation.mutate(announcementId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteAnnouncementMutation.isPending}
      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete announcement"
    >
      {deleteAnnouncementMutation.isPending && deleteAnnouncementMutation.variables === announcementId ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
};

export default AnnouncementManager;
