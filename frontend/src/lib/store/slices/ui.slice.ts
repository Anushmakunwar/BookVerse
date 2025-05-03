import { StateCreator } from 'zustand';

/**
 * UI state interface
 */
export interface UIState {
  ui: {
    isMobileMenuOpen: boolean;
    isCartOpen: boolean;
    isSearchOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    notifications: Notification[];
  };
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

/**
 * UI actions interface
 */
export interface UIActions {
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * Initial UI state
 */
const initialState: UIState = {
  ui: {
    isMobileMenuOpen: false,
    isCartOpen: false,
    isSearchOpen: false,
    theme: 'light',
    notifications: [],
  },
};

/**
 * Generate a unique ID for notifications
 */
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Create UI slice
 */
export const createUISlice: StateCreator<
  UIState & UIActions,
  [],
  [],
  UIState & UIActions
> = (set) => ({
  ...initialState,

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        isMobileMenuOpen: !state.ui.isMobileMenuOpen,
        // Close other overlays when opening mobile menu
        isCartOpen: state.ui.isMobileMenuOpen ? state.ui.isCartOpen : false,
        isSearchOpen: state.ui.isMobileMenuOpen ? state.ui.isSearchOpen : false,
      },
    }));
  },

  /**
   * Toggle cart
   */
  toggleCart: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        isCartOpen: !state.ui.isCartOpen,
        // Close other overlays when opening cart
        isMobileMenuOpen: state.ui.isCartOpen ? state.ui.isMobileMenuOpen : false,
        isSearchOpen: state.ui.isCartOpen ? state.ui.isSearchOpen : false,
      },
    }));
  },

  /**
   * Toggle search
   */
  toggleSearch: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        isSearchOpen: !state.ui.isSearchOpen,
        // Close other overlays when opening search
        isMobileMenuOpen: state.ui.isSearchOpen ? state.ui.isMobileMenuOpen : false,
        isCartOpen: state.ui.isSearchOpen ? state.ui.isCartOpen : false,
      },
    }));
  },

  /**
   * Set theme
   */
  setTheme: (theme) => {
    set((state) => ({
      ui: {
        ...state.ui,
        theme,
      },
    }));
  },

  /**
   * Add notification
   */
  addNotification: (notification) => {
    const id = generateId();
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [
          ...state.ui.notifications,
          {
            ...notification,
            id,
            duration: notification.duration || 5000,
          },
        ],
      },
    }));

    // Automatically remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter((n) => n.id !== id),
          },
        }));
      }, notification.duration || 5000);
    }
  },

  /**
   * Remove notification
   */
  removeNotification: (id) => {
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter((n) => n.id !== id),
      },
    }));
  },

  /**
   * Clear all notifications
   */
  clearNotifications: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [],
      },
    }));
  },
});
