import { useCurrentUser, useIsAdmin, useIsAuthenticated } from '@/lib/react-query/hooks/useAuth';

/**
 * A hook that provides authentication-related information
 * This is a compatibility layer for components that use the old useAuth hook
 */
export function useAuthHooks() {
  const { data: userData, isLoading } = useCurrentUser();
  const isAdmin = useIsAdmin();
  const isAuthenticated = useIsAuthenticated();
  
  return {
    user: userData?.user || null,
    loading: isLoading,
    isAuthenticated,
    isAdmin
  };
}
