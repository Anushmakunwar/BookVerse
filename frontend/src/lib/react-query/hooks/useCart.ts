import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/lib/api';
import { toast } from 'react-hot-toast';

/**
 * Query keys for cart
 */
export const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
};

/**
 * Hook to get the current user's cart
 */
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.items(),
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to add an item to the cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookId, quantity }: { bookId: number; quantity: number }) =>
      cartService.addToCart(bookId, quantity),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Added to cart');
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      } else {
        toast.error(data.message || 'Failed to add to cart');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while adding to cart');
    },
  });
};

/**
 * Hook to update a cart item
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      cartItemId,
      quantity,
    }: {
      cartItemId: number;
      quantity: number;
    }) => cartService.updateCartItem(cartItemId, quantity),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Cart updated');
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      } else {
        toast.error(data.message || 'Failed to update cart');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating cart');
    },
  });
};

/**
 * Hook to remove an item from the cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartItemId: number) => cartService.removeFromCart(cartItemId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Removed from cart');
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      } else {
        toast.error(data.message || 'Failed to remove from cart');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while removing from cart');
    },
  });
};

/**
 * Hook to clear the cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Cart cleared');
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      } else {
        toast.error(data.message || 'Failed to clear cart');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while clearing cart');
    },
  });
};
