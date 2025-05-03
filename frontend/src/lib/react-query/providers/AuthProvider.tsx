import React, { ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useLogin, useLogout, useRegister, authKeys } from '../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { routes, isAuthRoute, isAdminRoute, isMemberRoute } from '@/lib/routes';
import { toast } from 'react-hot-toast';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state using React Query
 * This provider handles:
 * 1. Initial authentication check
 * 2. Route protection based on auth status
 * 3. Redirects for authenticated/unauthenticated users
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  
  // Get current user data from React Query
  const { 
    data: userData, 
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser
  } = useCurrentUser();

  // Check if user is authenticated
  const isAuthenticated = !!userData?.user;
  const userRole = userData?.user?.role;
  const isAdmin = userRole === 'Admin';
  
  // Handle route protection
  useEffect(() => {
    // Skip during loading
    if (isUserLoading) return;
    
    // If on auth route but already authenticated, redirect to appropriate page
    if (isAuthenticated && isAuthRoute(pathname || '')) {
      if (isAdmin) {
        router.replace(routes.admin.dashboard);
      } else {
        router.replace(routes.home);
      }
      return;
    }
    
    // If on admin route but not admin, redirect
    if (isAdminRoute(pathname || '') && !isAdmin) {
      if (isAuthenticated) {
        toast.error('You do not have permission to access this page');
        router.replace(routes.home);
      } else {
        // Save the current path for redirect after login
        const returnUrl = encodeURIComponent(pathname || '');
        router.replace(`${routes.auth.login}?redirect=${returnUrl}`);
      }
      return;
    }
    
    // If on member route but not authenticated, redirect to login
    if (isMemberRoute(pathname || '') && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '');
      router.replace(`${routes.auth.login}?redirect=${returnUrl}`);
      return;
    }
  }, [isAuthenticated, isAdmin, pathname, isUserLoading, router]);

  // Handle authentication errors
  useEffect(() => {
    if (isUserError && userError) {
      console.error('Authentication error:', userError);
      // Only show toast for non-401 errors (401 is expected when not logged in)
      if ((userError as any).status !== 401) {
        toast.error('Authentication error. Please try logging in again.');
      }
      
      // Clear any stale auth data
      queryClient.setQueryData(authKeys.user(), null);
      localStorage.removeItem('bookstore_user');
    }
  }, [isUserError, userError, queryClient]);

  return <>{children}</>;
};

export default AuthProvider;
