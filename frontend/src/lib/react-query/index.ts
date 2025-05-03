import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options
 */
const defaultQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retry: 1,
  staleTime: 5 * 60 * 1000, // 5 minutes
};

/**
 * Create a new query client with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
  },
});
