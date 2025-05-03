import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useIsAdmin, useIsAuthenticated } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';
import { toast } from 'react-hot-toast';
import { FaLock, FaSpinner } from 'react-icons/fa';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  requiredRole?: string;
  fallback?: ReactNode;
}

/**
 * ProtectedRoute component that restricts access based on authentication and role
 * 
 * @param children - The content to render if authorized
 * @param adminOnly - If true, only admins can access
 * @param requiredRole - Specific role required to access
 * @param fallback - Optional component to render while checking authorization
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  requiredRole,
  fallback
}) => {
  const router = useRouter();
  const { data: userData, isLoading, isError } = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const [redirecting, setRedirecting] = useState(false);
  
  // Determine if user is authorized based on props
  const isAuthorized = 
    isAuthenticated && 
    (adminOnly ? isAdmin : true) &&
    (requiredRole ? userData?.user?.role === requiredRole : true);
  
  useEffect(() => {
    // Skip during loading or if already redirecting
    if (isLoading || redirecting) return;
    
    // If not authorized, redirect to appropriate page
    if (!isAuthorized) {
      setRedirecting(true);
      
      if (!isAuthenticated) {
        // Save current path for redirect after login
        const returnUrl = encodeURIComponent(window.location.pathname);
        toast.error('Please log in to access this page');
        router.replace(`${routes.auth.login}?redirect=${returnUrl}`);
      } else {
        // User is authenticated but doesn't have the required role
        toast.error('You do not have permission to access this page');
        router.replace(routes.home);
      }
    }
  }, [isAuthenticated, isAuthorized, isLoading, redirecting, router]);
  
  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
        <p className="text-neutral">Checking authorization...</p>
      </div>
    );
  }
  
  // If authorized, render children
  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
