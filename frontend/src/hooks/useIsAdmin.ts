import { useIsAdmin as useIsAdminQuery } from '@/lib/react-query/hooks/useAuth';

/**
 * Hook to check if the current user is an admin
 * This is a compatibility layer for components that use the old useIsAdmin hook
 */
export function useIsAdmin() {
  return useIsAdminQuery();
}
