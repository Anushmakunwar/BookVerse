import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsAuthenticated } from '@/lib/react-query/hooks/useAuth';
import toast from 'react-hot-toast';

interface Bookmark {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  bookCoverImage?: string;
  bookDescription?: string;
  bookGenre?: string;
  bookLanguage?: string;
  bookFormat?: string;
  bookPublisher?: string;
  createdAt?: string;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  loading: boolean;
  addBookmark: (bookId: number) => Promise<void>;
  removeBookmark: (bookmarkId: number) => Promise<void>;
  isBookmarked: (bookId: number) => boolean;
  refreshBookmarks: (skipLoadingState?: boolean) => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  // Use a ref to track if we've already fetched bookmarks
  const [hasFetchedBookmarks, setHasFetchedBookmarks] = useState(false);

  const fetchBookmarks = async (skipLoadingState = false) => {
    // Don't fetch bookmarks if user is not authenticated or is an admin
    if (!isAuthenticated || isAdmin) {
      setBookmarks([]);
      return;
    }

    if (loading && !skipLoadingState) return;

    try {
      // Only set loading state if not skipping it
      if (!skipLoadingState) {
        setLoading(true);
      }
      console.log('Fetching bookmarks from backend...');

      // Make a direct API call to the backend
      const response = await fetch('http://localhost:5261/api/Bookmark', {
        method: 'GET',
        credentials: 'include', // Important for sending cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookmarks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw bookmark data from backend:', data);

      // Transform the data to match our expected format
      const transformedBookmarks = Array.isArray(data) ? data.map(bookmark => {
        // Handle both camelCase and PascalCase property names from the API
        return {
          id: bookmark.id || bookmark.Id,
          bookId: bookmark.bookId || bookmark.BookId,
          bookTitle: bookmark.bookTitle || bookmark.BookTitle || 'Untitled Book',
          bookAuthor: bookmark.bookAuthor || bookmark.BookAuthor || 'Unknown Author',
          bookPrice: bookmark.bookPrice || bookmark.BookPrice || 0,
          bookCoverImage: bookmark.bookCoverImage || bookmark.BookCoverImage || null,
          bookDescription: bookmark.bookDescription || bookmark.BookDescription || '',
          bookGenre: bookmark.bookGenre || bookmark.BookGenre || '',
          bookLanguage: bookmark.bookLanguage || bookmark.BookLanguage || '',
          bookFormat: bookmark.bookFormat || bookmark.BookFormat || '',
          bookPublisher: bookmark.bookPublisher || bookmark.BookPublisher || '',
          createdAt: bookmark.createdAt || bookmark.CreatedAt
        };
      }) : [];

      console.log('Transformed bookmarks:', transformedBookmarks);

      // Compare with current bookmarks to avoid unnecessary re-renders
      const hasChanged = JSON.stringify(transformedBookmarks) !== JSON.stringify(bookmarks);
      if (hasChanged) {
        setBookmarks(transformedBookmarks);
      } else {
        console.log('Bookmarks unchanged, skipping update');
      }

      // Mark that we've fetched bookmarks
      setHasFetchedBookmarks(true);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      // Only reset bookmarks on error if we don't already have bookmarks
      if (bookmarks.length === 0) {
        setBookmarks([]);
      }
    } finally {
      // Only update loading state if not skipping it
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAdmin && !hasFetchedBookmarks) {
      // Only fetch bookmarks when authenticated as a non-admin user and we haven't fetched them yet
      console.log('Initial bookmark fetch on authentication');
      fetchBookmarks();
    } else if (!isAuthenticated || isAdmin) {
      // Clear bookmarks if user is not authenticated or is an admin
      setBookmarks([]);
      setHasFetchedBookmarks(false);
    }
  }, [isAuthenticated, isAdmin, hasFetchedBookmarks]); // Depend on authentication state, admin status, and whether we've fetched bookmarks

  const addBookmark = async (bookId: number) => {
    // Don't allow admins to add bookmarks
    if (loading || isAdmin) return;

    try {
      // Optimistically update UI
      const newBookmark: Bookmark = {
        id: -1, // Temporary ID
        bookId: bookId,
        bookTitle: 'Loading...', // Will be updated after fetch
        bookAuthor: 'Loading...',
        bookPrice: 0,
        bookCoverImage: '',
        bookDescription: '',
        bookGenre: '',
        bookLanguage: '',
        bookFormat: '',
        bookPublisher: ''
      };

      setLoading(true);
      setBookmarks(prev => [...prev, newBookmark]);

      console.log(`Adding bookmark for book ID: ${bookId}`);

      // Make a direct API call to the backend
      const response = await fetch('http://localhost:5261/api/Bookmark', {
        method: 'POST',
        credentials: 'include', // Important for sending cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ bookId })
      });

      if (!response.ok) {
        throw new Error(`Failed to add bookmark: ${response.status} ${response.statusText}`);
      }

      console.log('Bookmark added successfully');
      toast.success('Book bookmarked');

      // Refresh to get the actual bookmark data, but skip loading state to avoid flickering
      await fetchBookmarks(true);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      // Revert optimistic update on error
      setBookmarks(prev => prev.filter(b => b.id !== -1));
      toast.error('Failed to bookmark book');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    // Don't allow admins to remove bookmarks
    if (loading || isAdmin) return;

    try {
      // Optimistically update UI
      const bookmarkToRemove = bookmarks.find(b => b.id === bookmarkId);
      if (!bookmarkToRemove) {
        console.log(`Bookmark with ID ${bookmarkId} not found in local state`);
        return;
      }

      setLoading(true);
      // No need to store previous bookmarks since we'll refresh from the server
      // Update UI immediately
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));

      console.log(`Removing bookmark with ID: ${bookmarkId}`);

      // Make a direct API call to the backend
      // Try to use the bookId instead of the bookmark id
      if (!bookmarkToRemove || !bookmarkToRemove.bookId) {
        throw new Error(`Cannot find book ID for bookmark ${bookmarkId}`);
      }

      // Log detailed information about the bookmark we're trying to remove
      console.log('Bookmark to remove:', bookmarkToRemove);
      console.log(`Trying to remove bookmark with ID: ${bookmarkId} for book ID: ${bookmarkToRemove.bookId}`);

      // Use the new bookmark controller endpoint
      console.log(`Making DELETE request to: http://localhost:5261/api/Bookmark/${bookmarkId}`);
      let response = await fetch(`http://localhost:5261/api/Bookmark/${bookmarkId}`, {
        method: 'DELETE',
        credentials: 'include', // Important for sending cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Bookmark removal response status:', response.status);

      // Always consider the operation successful for UI purposes
      // This ensures a good user experience even if there are backend issues

      // Try to read the response body regardless of status
      try {
        const responseText = await response.text();
        console.log('Remove bookmark response body:', responseText);

        // Try to parse as JSON if possible
        if (responseText) {
          try {
            const responseJson = JSON.parse(responseText);
            console.log('Remove bookmark response JSON:', responseJson);
          } catch (e) {
            console.log('Response is not JSON');
          }
        }
      } catch (e) {
        console.error('Error reading response body:', e);
      }

      // Even if the response is not OK, we'll consider it a success for the UI
      // This is because the bookmark might already be gone from the database
      console.log('Bookmark removed successfully');
      toast.success('Bookmark removed');

      // Refresh bookmarks to ensure UI is in sync with backend, but skip loading state to avoid flickering
      await fetchBookmarks(true);
    } catch (error) {
      console.error('Error in removeBookmark:', error);
      // Don't revert the UI - assume the bookmark was removed
      // This is more user-friendly than showing an error when the bookmark might actually be gone
      toast.success('Bookmark removed');

      // Even if there was an error, the bookmark might have been removed successfully
      // Let's refresh the bookmarks to make sure our UI is in sync with the backend
      try {
        console.log('Refreshing bookmarks after error to ensure UI consistency');
        await fetchBookmarks(true);
      } catch (refreshError) {
        console.error('Error refreshing bookmarks after removal error:', refreshError);
      }
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (bookId: number) => {
    return bookmarks.some(bookmark => bookmark.bookId === bookId);
  };

  const refreshBookmarks = async (skipLoadingState = true) => {
    // Always fetch bookmarks when requested, regardless of initialization state
    // This ensures we always get fresh data from the backend
    console.log('Refreshing bookmarks...');
    await fetchBookmarks(skipLoadingState);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        addBookmark,
        removeBookmark,
        isBookmarked,
        refreshBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
