import { apiClient } from '../client';
import { BookmarkResponse } from '../types';
import { bookService } from './book.service';

/**
 * Bookmark service for handling bookmark-related operations
 */
export const bookmarkService = {
  /**
   * Get all bookmarks for the current user
   * @returns Promise with bookmarks
   */
  getBookmarks: async (): Promise<BookmarkResponse> => {
    try {
      const response = await apiClient.get('/Bookmark');
      
      // Transform the bookmarks to ensure valid image URLs
      const transformedBookmarks = response.data.bookmarks?.map((bookmark: any) => ({
        ...bookmark,
        book: {
          ...bookmark.book,
          coverImage: bookService.ensureValidImageUrl(bookmark.book.coverImage)
        }
      })) || [];

      return {
        success: true,
        bookmarks: transformedBookmarks
      };
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch bookmarks',
        bookmarks: []
      };
    }
  },

  /**
   * Add a bookmark
   * @param bookId - Book ID to bookmark
   * @returns Promise with bookmark result
   */
  addBookmark: async (bookId: number): Promise<{ success: boolean; message?: string; bookmarkId?: number }> => {
    try {
      const response = await apiClient.post('/Bookmark', { bookId });
      
      return {
        success: true,
        message: 'Book bookmarked successfully',
        bookmarkId: response.data.id || response.data.Id
      };
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      return {
        success: false,
        message: error.message || 'Failed to bookmark book'
      };
    }
  },

  /**
   * Remove a bookmark
   * @param bookmarkId - Bookmark ID to remove
   * @returns Promise with removal result
   */
  removeBookmark: async (bookmarkId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.delete(`/Bookmark/${bookmarkId}`);
      
      return {
        success: true,
        message: 'Bookmark removed successfully'
      };
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      return {
        success: false,
        message: error.message || 'Failed to remove bookmark'
      };
    }
  },

  /**
   * Check if a book is bookmarked
   * @param bookId - Book ID to check
   * @returns Promise with bookmark status
   */
  isBookmarked: async (bookId: number): Promise<{ success: boolean; isBookmarked: boolean; bookmarkId?: number }> => {
    try {
      const response = await apiClient.get(`/Bookmark/check/${bookId}`);
      
      return {
        success: true,
        isBookmarked: response.data.isBookmarked || false,
        bookmarkId: response.data.bookmarkId
      };
    } catch (error: any) {
      console.error('Error checking bookmark status:', error);
      return {
        success: false,
        isBookmarked: false
      };
    }
  }
};
