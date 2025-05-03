import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookService } from '@/lib/api';
import { Book, BookInput, BookSearchParams } from '@/lib/api/types';
import { toast } from 'react-hot-toast';

/**
 * Query keys for books
 */
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters: any) => [...bookKeys.lists(), { filters }] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookKeys.details(), id] as const,
};

/**
 * Hook to fetch all books
 */
export const useBooks = (page = 1, pageSize = 10, options = {}) => {
  return useQuery({
    queryKey: bookKeys.list({ page, pageSize }),
    queryFn: () => bookService.getAllBooks(page, pageSize),
    ...options,
  });
};

/**
 * Hook to fetch a book by ID
 */
export const useBook = (id: number) => {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookService.getBookById(id),
    enabled: !!id,
  });
};

/**
 * Hook to search books
 */
export const useSearchBooks = (params: BookSearchParams) => {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => bookService.searchBooks(params),
    enabled: !!params,
  });
};

/**
 * Hook to add a new book
 */
export const useAddBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookData: BookInput) => bookService.addBook(bookData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Book added successfully');

        // Simply invalidate the book lists query
        queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      } else {
        toast.error(data.message || 'Failed to add book');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while adding the book');
    },
  });
};

/**
 * Hook to update a book
 */
export const useUpdateBook = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookData: Partial<BookInput>) => bookService.updateBook(id, bookData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Book updated successfully');
        queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      } else {
        toast.error(data.message || 'Failed to update book');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating the book');
    },
  });
};

/**
 * Hook to delete a book
 */
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookService.deleteBook(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Book deleted successfully');
        queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      } else {
        toast.error(data.message || 'Failed to delete book');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while deleting the book');
    },
  });
};

/**
 * Hook to upload a book cover
 */
export const useUploadBookCover = (bookId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bookService.uploadBookCover(bookId, file),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Cover image uploaded successfully');
        queryClient.invalidateQueries({ queryKey: bookKeys.detail(bookId) });
        queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      } else {
        toast.error(data.message || 'Failed to upload cover image');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while uploading the cover image');
    },
  });
};
