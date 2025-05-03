import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createCartSlice, CartState, CartActions } from './slices/cart.slice';
import { createBookmarksSlice, BookmarksState, BookmarksActions } from './slices/bookmarks.slice';
import { createUISlice, UIState, UIActions } from './slices/ui.slice';

/**
 * Combined store state type
 */
export type StoreState = CartState & BookmarksState & UIState;

/**
 * Combined store actions type
 */
export type StoreActions = CartActions & BookmarksActions & UIActions;

/**
 * Create the store with all slices
 */
export const useStore = create<StoreState & StoreActions>()(
  devtools(
    persist(
      (...a) => ({
        ...createCartSlice(...a),
        ...createBookmarksSlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: 'bookstore-storage',
        partialize: (state) => ({
          // Only persist these parts of the state to localStorage
          cart: state.cart,
          bookmarks: state.bookmarks,
          // Don't persist UI state
        }),
      }
    )
  )
);
