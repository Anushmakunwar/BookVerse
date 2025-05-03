import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/lib/api/services/review.service';
import { CreateReviewInput, UpdateReviewInput } from '@/lib/api/types';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Query keys for reviews
 */
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: any) => [...reviewKeys.lists(), { filters }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: number) => [...reviewKeys.details(), id] as const,
  bookReviews: (bookId: number) => [...reviewKeys.lists(), 'book', bookId] as const,
  userReviews: () => [...reviewKeys.lists(), 'user'] as const,
  bookPurchase: (bookId: number) => [...reviewKeys.all, 'purchase', bookId] as const,
};

/**
 * Hook to fetch reviews for a specific book
 */
export const useBookReviews = (bookId: number) => {
  return useQuery({
    queryKey: reviewKeys.bookReviews(bookId),
    queryFn: () => reviewService.getBookReviews(bookId),
    enabled: !!bookId,
  });
};

/**
 * Hook to fetch reviews by the current user
 */
export const useUserReviews = () => {
  return useQuery({
    queryKey: reviewKeys.userReviews(),
    queryFn: () => reviewService.getUserReviews(),
  });
};

/**
 * Hook to fetch a specific review by ID
 */
export const useReview = (reviewId: number) => {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => reviewService.getReviewById(reviewId),
    enabled: !!reviewId,
  });
};

/**
 * Hook to create a new review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: CreateReviewInput) => reviewService.createReview(reviewData),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate book reviews and user reviews queries
        queryClient.invalidateQueries({ queryKey: reviewKeys.bookReviews(variables.bookId) });
        queryClient.invalidateQueries({ queryKey: reviewKeys.userReviews() });
        toast.success('Review submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });
};

/**
 * Hook to update an existing review
 */
export const useUpdateReview = (reviewId: number, bookId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: UpdateReviewInput) => reviewService.updateReview(reviewId, reviewData),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate book reviews, user reviews, and specific review queries
        queryClient.invalidateQueries({ queryKey: reviewKeys.bookReviews(bookId) });
        queryClient.invalidateQueries({ queryKey: reviewKeys.userReviews() });
        queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
        toast.success('Review updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update review');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = (bookId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewService.deleteReview(reviewId),
    onSuccess: (data, reviewId) => {
      if (data.success) {
        // Invalidate book reviews and user reviews queries
        queryClient.invalidateQueries({ queryKey: reviewKeys.bookReviews(bookId) });
        queryClient.invalidateQueries({ queryKey: reviewKeys.userReviews() });
        queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
        toast.success('Review deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete review');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });
};

/**
 * Hook to check if the current user has purchased a specific book
 */
export const useBookPurchaseCheck = (bookId: number) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Regular purchase check query
  const result = useQuery({
    queryKey: reviewKeys.bookPurchase(bookId),
    queryFn: () => reviewService.checkBookPurchase(bookId),
    enabled: !!bookId && isAuthenticated,
    // Reduce stale time to ensure more frequent refetches
    staleTime: 30 * 1000, // 30 seconds
    // Add retry for better reliability
    retry: 2,
    // Add refetch interval to periodically check for updates
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Force refresh mutation
  const forceRefreshMutation = useMutation({
    mutationFn: () => reviewService.refreshPurchaseStatus(bookId),
    onSuccess: (data) => {
      // Update the query cache with the new result
      queryClient.setQueryData(reviewKeys.bookPurchase(bookId), data);

      // Show toast message
      if (data.success) {
        toast.success(data.message || 'Purchase status refreshed');
      } else {
        toast.error(data.message || 'Failed to refresh purchase status');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to refresh purchase status');
    }
  });

  // Add a manual refresh function that forces a server-side refresh
  const refreshPurchaseStatus = () => {
    console.log('Force refreshing purchase status for book:', bookId);
    return forceRefreshMutation.mutate();
  };

  // Add a simple refetch function that just invalidates the cache
  const refetchPurchaseStatus = () => {
    console.log('Refetching purchase status for book:', bookId);
    return queryClient.invalidateQueries({
      queryKey: reviewKeys.bookPurchase(bookId)
    });
  };

  return {
    ...result,
    refreshPurchaseStatus,
    refetchPurchaseStatus,
    isRefreshing: forceRefreshMutation.isPending
  };
};
