import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api';
import { User } from '@/lib/api/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/routes';
import { useState } from 'react';

/**
 * Query keys for authentication
 */
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Hook to get the current user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 Unauthorized (expected when not logged in)
      if (error.status === 401) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    }
  });
};

/**
 * Hook to check if the current user is an admin
 */
export const useIsAdmin = () => {
  const { data } = useCurrentUser();
  return data?.user?.role === 'Admin';
};

/**
 * Hook to check if the user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data } = useCurrentUser();
  return !!data?.user;
};

/**
 * Hook to register a new user
 */
export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      fullName,
      email,
      password,
    }: {
      fullName: string;
      email: string;
      password: string;
    }) => authService.register(fullName, email, password),

    onSuccess: async (data) => {
      if (data.success) {
        toast.success('Registration successful! Please log in.');

        // Add a small delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 300));

        // Redirect to login page
        router.push(routes.auth.login);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    },

    onError: (error: any) => {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });
};

/**
 * Hook to login a user
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password, redirectUrl }: {
      email: string;
      password: string;
      redirectUrl?: string;
    }) => authService.login(email, password),

    onSuccess: async (data) => {
      if (data.success) {
        // Clear all existing queries to prevent stale data
        queryClient.clear();

        // Add a delay to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 500));

        // Invalidate the user query to fetch fresh user data
        await queryClient.invalidateQueries({ queryKey: authKeys.user() });

        // Fetch the user data to ensure we have it in the cache
        const userResponse = await queryClient.fetchQuery({
          queryKey: authKeys.user(),
          queryFn: () => authService.getCurrentUser(),
        });

        if (userResponse.success && userResponse.user) {
          // Store user in localStorage for persistence
          localStorage.setItem('bookstore_user', JSON.stringify(userResponse.user));

          toast.success('Login successful');

          // Add a delay before redirecting to ensure all state is updated
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if user is admin
          if (userResponse.user.role === 'Admin') {
            // Admin users always go to admin dashboard, regardless of redirect URL
            console.log('Admin user detected, redirecting to admin dashboard');

            // Use window.location for a full page reload to ensure clean state
            window.location.href = routes.admin.dashboard;
          } else {
            // For non-admin users, check for redirect URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('redirect');

            if (redirectPath) {
              console.log('Redirecting to:', redirectPath);
              router.push(decodeURIComponent(redirectPath));
            } else {
              // Default redirect for regular users
              router.push(routes.home);
            }
          }
        } else {
          toast.error('Login successful but failed to get user details');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    },

    onError: (error: any) => {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login');
    },
  });
};

/**
 * Hook to logout a user
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),

    onMutate: async () => {
      // Optimistically update by removing user data from cache
      queryClient.setQueryData(authKeys.user(), { success: false, user: null });

      // Remove user from localStorage
      localStorage.removeItem('bookstore_user');
    },

    onSuccess: async () => {
      // Clear all queries from cache
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      // Clear all other query cache to prevent stale data
      queryClient.clear();

      // Remove user from localStorage
      localStorage.removeItem('bookstore_user');

      toast.success('Logged out successfully');

      // Add a longer delay before redirecting to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to home page
      router.push(routes.home);
    },

    onError: async (error) => {
      console.error('Logout error:', error);

      // Even if the API call fails, we'll still log the user out locally
      queryClient.setQueryData(authKeys.user(), { success: false, user: null });

      // Clear all query cache to prevent stale data
      queryClient.clear();

      // Remove user from localStorage
      localStorage.removeItem('bookstore_user');

      toast.success('Logged out successfully');

      // Add a longer delay before redirecting to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to home page and force a full page reload to clear any remaining state
      window.location.href = routes.home;
    },
  });
};

/**
 * Hook to request a password reset OTP
 */
export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),

    onSuccess: async (data) => {
      if (data.success) {
        toast.success(data.message || 'OTP sent successfully');

        // Add a small delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 300));

        // Redirect to reset password page with email in query params
        router.push(`${routes.auth.resetPassword}?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    },

    onError: (error: any) => {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    },
  });
};

/**
 * Hook to reset password with OTP
 */
export const useResetPasswordWithOTP = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      email,
      otp,
      newPassword,
      confirmPassword,
    }: {
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }) => authService.resetPasswordWithOTP(email, otp, newPassword, confirmPassword),

    onSuccess: async (data) => {
      if (data.success) {
        toast.success(data.message || 'Password reset successful');

        // Add a small delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 300));

        // Redirect to login page
        router.push(routes.auth.login);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    },

    onError: (error: any) => {
      console.error('Reset password error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    },
  });
};