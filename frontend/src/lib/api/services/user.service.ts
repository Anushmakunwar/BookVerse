import { apiClient } from '@/lib/api/client';

/**
 * User management response interface
 */
export interface UserManagementResponse {
  success: boolean;
  message?: string;
  users?: UserManagement[];
  user?: UserManagement;
}

/**
 * User management interface
 */
export interface UserManagement {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

/**
 * Create user input interface
 */
export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

/**
 * Update user input interface
 */
export interface UpdateUserInput {
  email?: string;
  password?: string;
  fullName: string;
  role?: string;
}

/**
 * User management service
 */
export const userService = {
  /**
   * Get all users (admin only)
   * @returns Promise with users
   */
  getAllUsers: async (): Promise<UserManagementResponse> => {
    try {
      const response = await apiClient.get('/User');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get users',
        users: []
      };
    }
  },

  /**
   * Get user by ID (admin only)
   * @param id - User ID
   * @returns Promise with user
   */
  getUserById: async (id: string): Promise<UserManagementResponse> => {
    try {
      const response = await apiClient.get(`/User/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user',
        user: undefined
      };
    }
  },

  /**
   * Create user (admin only)
   * @param user - User data
   * @returns Promise with created user
   */
  createUser: async (user: CreateUserInput): Promise<UserManagementResponse> => {
    try {
      const response = await apiClient.post('/User', user);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create user',
        user: undefined
      };
    }
  },

  /**
   * Update user (admin only)
   * @param id - User ID
   * @param user - User data
   * @returns Promise with updated user
   */
  updateUser: async (id: string, user: UpdateUserInput): Promise<UserManagementResponse> => {
    try {
      const response = await apiClient.put(`/User/${id}`, user);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        user: undefined
      };
    }
  },

  /**
   * Delete user (admin only)
   * @param id - User ID
   * @returns Promise with success status
   */
  deleteUser: async (id: string): Promise<UserManagementResponse> => {
    try {
      const response = await apiClient.delete(`/User/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }
};
