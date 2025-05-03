import { apiClient } from '../client';
import { AuthResponse, User } from '../types';

/**
 * Authentication service for handling user authentication
 */
export const authService = {
  /**
   * Register a new user
   * @param fullName - User's full name
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with registration result
   */
  register: async (
    fullName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/Auth/register', {
        fullName,
        email,
        password,
      });
      
      return {
        success: true,
        message: 'Registration successful',
        ...response.data,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  },

  /**
   * Login a user
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with login result
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with credentials:', { email });
      const response = await apiClient.post('/Auth/login', { email, password });
      
      // Check for cookies in the response headers
      const cookies = document.cookie;
      console.log('Cookies after login:', cookies);

      // Add a small delay to ensure cookies are properly set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify the cookie was set
      const cookiesAfterDelay = document.cookie;
      console.log('Cookies after delay:', cookiesAfterDelay);

      return {
        success: true,
        message: 'Login successful',
        ...response.data,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  },

  /**
   * Logout the current user
   * @returns Promise with logout result
   */
  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/Auth/logout');
      
      return {
        success: true,
        message: 'Logout successful',
        ...response.data,
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  },

  /**
   * Get the current authenticated user
   * @returns Promise with current user
   */
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        // Check if there are any cookies set
        if (!document.cookie) {
          console.log('No cookies found, user is likely not authenticated');
        } else {
          console.log('Cookies found, checking authentication...');
        }
      }

      // Even if there are no cookies, still make the request
      // Our interceptor will handle the 401 error gracefully
      const response = await apiClient.get('/Auth/me');

      // If we get here, the request was successful
      if (process.env.NODE_ENV === 'development') {
        console.log('User authenticated successfully');
      }

      return {
        success: true,
        message: 'User authenticated',
        user: response.data.user,
      };
    } catch (error: any) {
      // This should rarely happen now that we handle 401 in the interceptor
      // But we'll keep it for other types of errors

      // If there's a network error, handle it gracefully
      if (error.message && error.message.includes('Network Error')) {
        console.warn('Network error when checking authentication');
        return {
          success: false,
          message: 'Network error when checking authentication',
          user: undefined,
        };
      }

      // For any other errors
      console.warn('Error in getCurrentUser:', error.message || 'Unknown error');
      return {
        success: false,
        message: error.message || 'Failed to get current user',
        user: undefined,
      };
    }
  },
};
