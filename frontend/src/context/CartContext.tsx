import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService } from '@/lib/api/services/cart.service';
import { bookService } from '@/lib/api/services/book.service';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsAuthenticated } from '@/lib/react-query/hooks/useAuth';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  price: number;
  quantity: number;
  totalPrice: number;
  coverImage: string | null;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  hasInitiallyLoaded: boolean; // Track if the cart has been loaded at least once
  isUpdating: Record<number, boolean>; // Track loading state per item
  isAdding: boolean;
  isClearing: boolean;
  addToCart: (bookId: number, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  const fetchCart = async (showLoading = true) => {
    // Don't fetch cart if user is not authenticated or is an admin
    if (!isAuthenticated || isAdmin) {
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      setHasInitiallyLoaded(true);
      return;
    }

    try {
      // Only show loading state if explicitly requested and if we haven't loaded yet
      // This prevents flickering when refreshing the cart
      if (showLoading && !hasInitiallyLoaded) {
        setLoading(true);
      }

      const response = await cartService.getCart();
      if (response.success) {
        // Process the items to ensure valid cover image URLs
        const processedItems = (response.items || []).map(item => ({
          ...item,
          coverImage: item.coverImage ? bookService.ensureValidImageUrl(item.coverImage) : null
        }));

        setItems(processedItems);
        setTotalItems(response.totalItems || 0);
        setTotalPrice(response.totalPrice || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
      setHasInitiallyLoaded(true);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, isAdmin]);

  const addToCart = async (bookId: number, quantity: number) => {
    // Don't allow admins to add to cart
    if (isAdmin) return;

    try {
      setIsAdding(true);

      // Make the API call
      const response = await cartService.addToCart(bookId, quantity);

      if (response.success) {
        toast.success('Added to cart');

        // Update the cart data with the response data
        if (response.items) {
          // Process the items to ensure valid cover image URLs
          const processedItems = response.items.map(item => ({
            ...item,
            coverImage: item.coverImage ? bookService.ensureValidImageUrl(item.coverImage) : null
          }));

          setItems(processedItems);
          setTotalItems(response.totalItems || 0);
          setTotalPrice(response.totalPrice || 0);
        } else {
          // If the response doesn't include the updated cart, fetch it
          await fetchCart();
        }
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    // Don't allow admins to update cart
    if (isAdmin) return;

    try {
      // Set loading state for this specific item
      setIsUpdating(prev => ({ ...prev, [cartItemId]: true }));

      // Optimistically update the UI
      const updatedItems = items.map(item => {
        if (item.id === cartItemId) {
          const newTotalPrice = (item.price * quantity);
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      });

      // Calculate new totals
      const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Update state immediately for a responsive UI
      setItems(updatedItems);
      setTotalItems(newTotalItems);
      setTotalPrice(newTotalPrice);

      // Make the API call
      const response = await cartService.updateCartItem(cartItemId, quantity);

      if (response.success) {
        toast.success('Cart updated');

        // If the response includes updated cart data, use it to ensure consistency
        if (response.items) {
          // Process the items to ensure valid cover image URLs
          const processedItems = response.items.map(item => ({
            ...item,
            coverImage: item.coverImage ? bookService.ensureValidImageUrl(item.coverImage) : null
          }));

          setItems(processedItems);
          setTotalItems(response.totalItems || 0);
          setTotalPrice(response.totalPrice || 0);
        }
      } else {
        // If the update failed, revert to the original state
        await fetchCart();
        toast.error('Failed to update cart');
      }
    } catch (error) {
      // If there was an error, revert to the original state
      await fetchCart();
      toast.error('Failed to update cart');
    } finally {
      // Clear the loading state for this item
      setIsUpdating(prev => {
        const newState = { ...prev };
        delete newState[cartItemId];
        return newState;
      });
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    // Don't allow admins to remove from cart
    if (isAdmin) return;

    try {
      // Set loading state for this specific item
      setIsUpdating(prev => ({ ...prev, [cartItemId]: true }));

      // Find the item to be removed
      const itemToRemove = items.find(item => item.id === cartItemId);

      // Optimistically update the UI
      const updatedItems = items.filter(item => item.id !== cartItemId);

      // Calculate new totals
      const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Update state immediately for a responsive UI
      setItems(updatedItems);
      setTotalItems(newTotalItems);
      setTotalPrice(newTotalPrice);

      // Make the API call
      const response = await cartService.removeFromCart(cartItemId);

      if (response.success) {
        toast.success('Item removed from cart');

        // If the response includes updated cart data, use it to ensure consistency
        if (response.items) {
          // Process the items to ensure valid cover image URLs
          const processedItems = response.items.map(item => ({
            ...item,
            coverImage: item.coverImage ? bookService.ensureValidImageUrl(item.coverImage) : null
          }));

          setItems(processedItems);
          setTotalItems(response.totalItems || 0);
          setTotalPrice(response.totalPrice || 0);
        }
      } else {
        // If the removal failed, revert to the original state
        await fetchCart();
        toast.error('Failed to remove item from cart');
      }
    } catch (error) {
      // If there was an error, revert to the original state
      await fetchCart();
      toast.error('Failed to remove item from cart');
    } finally {
      // Clear the loading state for this item
      setIsUpdating(prev => {
        const newState = { ...prev };
        delete newState[cartItemId];
        return newState;
      });
    }
  };

  const clearCart = async () => {
    // Don't allow admins to clear cart
    if (isAdmin) return;

    try {
      setIsClearing(true);

      // Optimistically update the UI
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);

      // Make the API call
      const response = await cartService.clearCart();

      if (response.success) {
        toast.success('Cart cleared');
      } else {
        // If clearing failed, revert to the original state
        await fetchCart();
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      // If there was an error, revert to the original state
      await fetchCart();
      toast.error('Failed to clear cart');
    } finally {
      setIsClearing(false);
    }
  };

  const refreshCart = async (showLoading = false) => {
    // By default, don't show loading state when refreshing to avoid flickering
    await fetchCart(showLoading);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        loading,
        hasInitiallyLoaded,
        isUpdating,
        isAdding,
        isClearing,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
