import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/lib/api/services/order.service';
import { toast } from 'react-hot-toast';

/**
 * Query keys for orders
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: any) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

/**
 * Hook to fetch user's orders
 */
export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderService.getOrders(),
  });
};

/**
 * Hook to fetch a specific order by ID
 */
export const useOrder = (orderId: number) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note?: string) => orderService.createOrder(note),
    onSuccess: async (data) => {
      if (data.success) {
        // Invalidate orders and cart queries
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ['cart'] });

        // Invalidate the auth user query to refresh totalOrders count
        await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

        // Force a refresh of the user data
        try {
          const authService = (await import('@/lib/api')).authService;
          const userResponse = await authService.getCurrentUser();

          if (userResponse.success && userResponse.user) {
            // Update localStorage with the latest user data
            localStorage.setItem('bookstore_user', JSON.stringify(userResponse.user));
            console.log('Updated user data after order:', userResponse.user);
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }

        toast.success('Order created successfully!');
      } else {
        toast.error(data.message || 'Failed to create order');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderService.cancelOrder(orderId),
    onSuccess: (data, orderId) => {
      if (data.success) {
        // Invalidate orders queries
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        toast.success('Order cancelled successfully!');
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });
};

/**
 * Order processing input interface
 */
export interface ProcessOrderInput {
  claimCode: string;
  membershipId: string;
}

/**
 * Hook to process an order (staff/admin only)
 */
export const useProcessOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProcessOrderInput) =>
      orderService.processOrder(input.claimCode, input.membershipId),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate all orders queries
        queryClient.invalidateQueries({ queryKey: orderKeys.all });

        // Invalidate purchase check queries to update review permissions
        queryClient.invalidateQueries({ queryKey: ['reviews', 'purchase'] });

        toast.success('Order processed successfully!');
      } else {
        toast.error(data.message || 'Failed to process order');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process order');
    },
  });
};

/**
 * Hook to fetch all orders (staff/admin only)
 */
export const useAllOrders = (processed?: boolean | null) => {
  return useQuery({
    queryKey: orderKeys.list({ processed }),
    queryFn: () => orderService.getAllOrders(processed !== null ? processed : undefined),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onError: (error) => {
      console.error('Error fetching orders:', error);
    },
  });
};
