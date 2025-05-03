import { StateCreator } from 'zustand';
import { Book } from '@/lib/api/types';

/**
 * Cart item interface
 */
export interface CartItem {
  id: number;
  bookId: number;
  quantity: number;
  book: Book;
}

/**
 * Cart state interface
 */
export interface CartState {
  cart: {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    isLoading: boolean;
    error: string | null;
  };
}

/**
 * Cart actions interface
 */
export interface CartActions {
  setCart: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  updateCartItem: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  setCartLoading: (isLoading: boolean) => void;
  setCartError: (error: string | null) => void;
}

/**
 * Initial cart state
 */
const initialState: CartState = {
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
  },
};

/**
 * Calculate cart totals
 */
const calculateCartTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.quantity * item.book.price,
    0
  );
  return { totalItems, totalPrice };
};

/**
 * Create cart slice
 */
export const createCartSlice: StateCreator<
  CartState & CartActions,
  [],
  [],
  CartState & CartActions
> = (set, get) => ({
  ...initialState,

  /**
   * Set the entire cart
   */
  setCart: (items) => {
    const { totalItems, totalPrice } = calculateCartTotals(items);
    set({
      cart: {
        items,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Add an item to the cart
   */
  addToCart: (newItem) => {
    const { items } = get().cart;
    
    // Check if the item already exists in the cart
    const existingItemIndex = items.findIndex(
      (item) => item.bookId === newItem.bookId
    );

    let updatedItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedItems = items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );
    } else {
      // Add new item if it doesn't exist
      updatedItems = [...items, newItem];
    }

    const { totalItems, totalPrice } = calculateCartTotals(updatedItems);

    set({
      cart: {
        items: updatedItems,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Update a cart item's quantity
   */
  updateCartItem: (id, quantity) => {
    const { items } = get().cart;
    
    // Update the item quantity
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    const { totalItems, totalPrice } = calculateCartTotals(updatedItems);

    set({
      cart: {
        items: updatedItems,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Remove an item from the cart
   */
  removeFromCart: (id) => {
    const { items } = get().cart;
    
    // Filter out the item to remove
    const updatedItems = items.filter((item) => item.id !== id);

    const { totalItems, totalPrice } = calculateCartTotals(updatedItems);

    set({
      cart: {
        items: updatedItems,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Clear the cart
   */
  clearCart: () => {
    set({
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
        error: null,
      },
    });
  },

  /**
   * Set cart loading state
   */
  setCartLoading: (isLoading) => {
    set((state) => ({
      cart: {
        ...state.cart,
        isLoading,
        error: isLoading ? null : state.cart.error,
      },
    }));
  },

  /**
   * Set cart error
   */
  setCartError: (error) => {
    set((state) => ({
      cart: {
        ...state.cart,
        error,
        isLoading: false,
      },
    }));
  },
});
