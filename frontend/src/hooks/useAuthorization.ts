import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuthorization(requiredRole?: string | boolean) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Wait until authentication check is complete
    if (loading) return;

    // Prevent multiple redirects
    if (redirected) return;

    // If user is not authenticated, redirect to login with the current path as redirect target
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      setRedirected(true);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Handle adminOnly parameter (true means Admin role is required)
    if (requiredRole === true && user?.role !== 'Admin') {
      setRedirected(true);
      router.push('/unauthorized');
      return;
    }

    // Handle staffOnly parameter ('Staff' means Staff or Admin role is required)
    if (requiredRole === 'Staff' && user?.role !== 'Staff' && user?.role !== 'Admin') {
      setRedirected(true);
      router.push('/unauthorized');
      return;
    }

    // If specific role is required and user doesn't have it
    if (typeof requiredRole === 'string' && requiredRole !== 'Staff' && user?.role !== requiredRole) {
      setRedirected(true);
      router.push('/unauthorized');
      return;
    }

    // Always redirect staff users to staff pages
    if (user?.role === 'Staff') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/staff')) {
        setRedirected(true);
        router.push('/staff');
        return;
      }
    }
  }, [user, isAuthenticated, loading, requiredRole, router, redirected]);

  // Reset redirected state when authentication status changes
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setRedirected(false);
    }
  }, [isAuthenticated, loading]);

  return {
    isAuthorized: requiredRole === true
      ? isAuthenticated && user?.role === 'Admin'
      : requiredRole === 'Staff'
        ? isAuthenticated && (user?.role === 'Staff' || user?.role === 'Admin')
        : typeof requiredRole === 'string'
          ? isAuthenticated && user?.role === requiredRole
          : isAuthenticated,
    isAdmin: user?.role === 'Admin',
    isStaff: user?.role === 'Staff',
    isMember: user?.role === 'Member',
    isLoading: loading
  };
}
