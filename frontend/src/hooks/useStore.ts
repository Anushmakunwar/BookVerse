import { useStore as useZustandStore } from '@/lib/store';
import { StoreState, StoreActions } from '@/lib/store';

/**
 * Custom hook to access the entire store
 */
export const useStore = useZustandStore;

/**
 * Custom hook to access cart state and actions
 */
export const useCart = () => {
  const cart = useZustandStore((state) => state.cart);
  const setCart = useZustandStore((state) => state.setCart);
  const addToCart = useZustandStore((state) => state.addToCart);
  const updateCartItem = useZustandStore((state) => state.updateCartItem);
  const removeFromCart = useZustandStore((state) => state.removeFromCart);
  const clearCart = useZustandStore((state) => state.clearCart);
  const setCartLoading = useZustandStore((state) => state.setCartLoading);
  const setCartError = useZustandStore((state) => state.setCartError);

  return {
    cart,
    setCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    setCartLoading,
    setCartError,
  };
};

/**
 * Custom hook to access bookmarks state and actions
 */
export const useBookmarks = () => {
  const bookmarks = useZustandStore((state) => state.bookmarks);
  const setBookmarks = useZustandStore((state) => state.setBookmarks);
  const addBookmark = useZustandStore((state) => state.addBookmark);
  const removeBookmark = useZustandStore((state) => state.removeBookmark);
  const clearBookmarks = useZustandStore((state) => state.clearBookmarks);
  const setBookmarksLoading = useZustandStore((state) => state.setBookmarksLoading);
  const setBookmarksError = useZustandStore((state) => state.setBookmarksError);

  return {
    bookmarks,
    setBookmarks,
    addBookmark,
    removeBookmark,
    clearBookmarks,
    setBookmarksLoading,
    setBookmarksError,
  };
};

/**
 * Custom hook to access UI state and actions
 */
export const useUI = () => {
  const ui = useZustandStore((state) => state.ui);
  const toggleMobileMenu = useZustandStore((state) => state.toggleMobileMenu);
  const toggleCart = useZustandStore((state) => state.toggleCart);
  const toggleSearch = useZustandStore((state) => state.toggleSearch);
  const setTheme = useZustandStore((state) => state.setTheme);
  const addNotification = useZustandStore((state) => state.addNotification);
  const removeNotification = useZustandStore((state) => state.removeNotification);
  const clearNotifications = useZustandStore((state) => state.clearNotifications);

  return {
    ui,
    toggleMobileMenu,
    toggleCart,
    toggleSearch,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};
