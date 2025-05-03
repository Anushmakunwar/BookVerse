import { StateCreator } from 'zustand';
import { Book } from '@/lib/api/types';

/**
 * Bookmark interface
 */
export interface Bookmark {
  id: number;
  bookId: number;
  book: Book;
}

/**
 * Bookmarks state interface
 */
export interface BookmarksState {
  bookmarks: {
    items: Bookmark[];
    isLoading: boolean;
    error: string | null;
  };
}

/**
 * Bookmarks actions interface
 */
export interface BookmarksActions {
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: number) => void;
  clearBookmarks: () => void;
  setBookmarksLoading: (isLoading: boolean) => void;
  setBookmarksError: (error: string | null) => void;
}

/**
 * Initial bookmarks state
 */
const initialState: BookmarksState = {
  bookmarks: {
    items: [],
    isLoading: false,
    error: null,
  },
};

/**
 * Create bookmarks slice
 */
export const createBookmarksSlice: StateCreator<
  BookmarksState & BookmarksActions,
  [],
  [],
  BookmarksState & BookmarksActions
> = (set) => ({
  ...initialState,

  /**
   * Set all bookmarks
   */
  setBookmarks: (items) => {
    set({
      bookmarks: {
        items,
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Add a bookmark
   */
  addBookmark: (bookmark) => {
    set((state) => ({
      bookmarks: {
        items: [...state.bookmarks.items, bookmark],
        isLoading: false,
        error: null,
      },
    }));
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: (id) => {
    set((state) => ({
      bookmarks: {
        items: state.bookmarks.items.filter((bookmark) => bookmark.id !== id),
        isLoading: false,
        error: null,
      },
    }));
  },

  /**
   * Clear all bookmarks
   */
  clearBookmarks: () => {
    set({
      bookmarks: {
        items: [],
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Set bookmarks loading state
   */
  setBookmarksLoading: (isLoading) => {
    set((state) => ({
      bookmarks: {
        ...state.bookmarks,
        isLoading,
        error: isLoading ? null : state.bookmarks.error,
      },
    }));
  },

  /**
   * Set bookmarks error
   */
  setBookmarksError: (error) => {
    set((state) => ({
      bookmarks: {
        ...state.bookmarks,
        error,
        isLoading: false,
      },
    }));
  },
});
