import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '@/lib/api';
import { toast } from 'react-hot-toast';

/**
 * Query keys for bookmarks
 */
export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  status: () => [...bookmarkKeys.all, 'status'] as const,
  bookStatus: (bookId: number) => [...bookmarkKeys.status(), bookId] as const,
};

/**
 * Hook to get all bookmarks for the current user
 */
export const useBookmarks = () => {
  return useQuery({
    queryKey: bookmarkKeys.lists(),
    queryFn: () => bookmarkService.getBookmarks(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to check if a book is bookmarked
 */
export const useIsBookmarked = (bookId: number) => {
  return useQuery({
    queryKey: bookmarkKeys.bookStatus(bookId),
    queryFn: () => bookmarkService.isBookmarked(bookId),
    enabled: !!bookId,
  });
};

/**
 * Hook to add a bookmark
 */
export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookId: number) => bookmarkService.addBookmark(bookId),
    onSuccess: (data, bookId) => {
      if (data.success) {
        toast.success('Book bookmarked');
        queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
        queryClient.invalidateQueries({ queryKey: bookmarkKeys.bookStatus(bookId) });
      } else {
        toast.error(data.message || 'Failed to bookmark book');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while bookmarking');
    },
  });
};

/**
 * Hook to remove a bookmark
 */
export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookmarkId, bookId }: { bookmarkId: number; bookId: number }) =>
      bookmarkService.removeBookmark(bookmarkId),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success('Bookmark removed');
        queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
        queryClient.invalidateQueries({ queryKey: bookmarkKeys.bookStatus(variables.bookId) });
      } else {
        toast.error(data.message || 'Failed to remove bookmark');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while removing bookmark');
    },
  });
};
