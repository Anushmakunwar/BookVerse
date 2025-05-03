'use client';

import React, { useState } from 'react';
import { useCreateUser, useUpdateUser } from '@/lib/react-query/hooks/useUsers';
import { UserManagement, CreateUserInput, UpdateUserInput } from '@/lib/api/services/user.service';
import { Loader2 } from 'lucide-react';

interface UserFormProps {
  user: UserManagement | null;
  onCancel: () => void;
}

/**
 * Form for creating or editing users (admin only)
 */
const UserForm: React.FC<UserFormProps> = ({ user, onCancel }) => {
  const isEditing = !!user;
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser(user?.id || '');
  
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    fullName: string;
    role: string;
  }>({
    email: user?.email || '',
    password: '',
    fullName: user?.fullName || '',
    role: user?.role || 'Member',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // For updates, only include fields that have changed
      const updateData: UpdateUserInput = {
        fullName: formData.fullName,
      };
      
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (formData.role !== user.role) {
        updateData.role = formData.role;
      }
      
      updateUserMutation.mutate(updateData, {
        onSuccess: (data) => {
          if (data.success) {
            onCancel();
          }
        },
      });
    } else {
      // For new users, include all fields
      const createData: CreateUserInput = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      };
      
      createUserMutation.mutate(createData, {
        onSuccess: (data) => {
          if (data.success) {
            onCancel();
          }
        },
      });
    }
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create New User'}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password {isEditing && '(leave blank to keep current)'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            minLength={6}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Member">Member</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
