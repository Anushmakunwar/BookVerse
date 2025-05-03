'use client';

import React, { useState } from 'react';
import { useAllUsers, useDeleteUser } from '@/lib/react-query/hooks/useUsers';
import { UserManagement } from '@/lib/api/services/user.service';
import { formatDate } from '@/lib/utils';
import { Loader2, AlertCircle, Plus, Edit, Trash2, User } from 'lucide-react';
import UserForm from './UserForm';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Component for managing users (admin only)
 */
const UserManager: React.FC = () => {
  const { data, isLoading, isError } = useAllUsers();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const deleteUserMutation = useDeleteUser();
  const { user: currentUser } = useAuth();

  const handleEdit = (user: UserManagement) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Users</h3>
        <p className="text-gray-600 mb-4">
          There was a problem loading the user list. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-xl shadow-md hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New User
          </button>
        )}
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onCancel={handleCancel}
        />
      )}

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'Admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'Staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteUserMutation.isPending}
                        >
                          {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
