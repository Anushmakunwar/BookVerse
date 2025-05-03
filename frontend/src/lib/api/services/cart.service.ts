import { apiClient } from '../client';
import { CartResponse } from '../types';
import { bookService } from './book.service';

/**
 * Cart service for handling cart-related operations
 */
export const cartService = {
  /**
   * Get the current user's cart
   * @returns Promise with cart data
   */
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiClient.get('/Cart');

      // Transform the cart items to ensure valid image URLs
      const transformedItems = response.data.items?.map((item: any) => {
        // Check if item and item.book exist
        if (!item || !item.book) {
          console.warn('Invalid cart item found:', item);
          return item; // Return the item as is if it's invalid
        }

        return {
          ...item,
          book: {
            ...item.book,
            coverImage: bookService.ensureValidImageUrl(item.book.coverImage)
          }
        };
      }).filter(Boolean) || []; // Filter out any null/undefined items

      return {
        success: true,
        items: transformedItems,
        totalItems: response.data.totalItems || transformedItems.length,
        totalPrice: response.data.totalPrice || 0
      };
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch cart',
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }
  },

  /**
   * Add an item to the cart
   * @param bookId - Book ID
   * @param quantity - Quantity to add
   * @returns Promise with updated cart
   */
  addToCart: async (bookId: number, quantity: number): Promise<CartResponse> => {
    try {
      const response = await apiClient.post('/Cart', { bookId, quantity });

      // Transform the cart items to ensure valid image URLs
      const transformedItems = response.data.items?.map((item: any) => {
        // Check if item and item.book exist
        if (!item || !item.book) {
          console.warn('Invalid cart item found:', item);
          return item; // Return the item as is if it's invalid
        }

        return {
          ...item,
          book: {
            ...item.book,
            coverImage: bookService.ensureValidImageUrl(item.book.coverImage)
          }
        };
      }).filter(Boolean) || []; // Filter out any null/undefined items

      return {
        success: true,
        message: 'Item added to cart',
        items: transformedItems,
        totalItems: response.data.totalItems || transformedItems.length,
        totalPrice: response.data.totalPrice || 0
      };
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to add item to cart',
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }
  },

  /**
   * Update cart item quantity
   * @param cartItemId - Cart item ID
   * @param quantity - New quantity
   * @returns Promise with updated cart
   */
  updateCartItem: async (cartItemId: number, quantity: number): Promise<CartResponse> => {
    try {
      const response = await apiClient.put(`/Cart/${cartItemId}`, { quantity });

      // Transform the cart items to ensure valid image URLs
      const transformedItems = response.data.items?.map((item: any) => {
        // Check if item and item.book exist
        if (!item || !item.book) {
          console.warn('Invalid cart item found:', item);
          return item; // Return the item as is if it's invalid
        }

        return {
          ...item,
          book: {
            ...item.book,
            coverImage: bookService.ensureValidImageUrl(item.book.coverImage)
          }
        };
      }).filter(Boolean) || []; // Filter out any null/undefined items

      return {
        success: true,
        message: 'Cart item updated',
        items: transformedItems,
        totalItems: response.data.totalItems || transformedItems.length,
        totalPrice: response.data.totalPrice || 0
      };
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        message: error.message || 'Failed to update cart item',
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }
  },

  /**
   * Remove an item from the cart
   * @param cartItemId - Cart item ID
   * @returns Promise with updated cart
   */
  removeFromCart: async (cartItemId: number): Promise<CartResponse> => {
    try {
      const response = await apiClient.delete(`/Cart/${cartItemId}`);

      // Transform the cart items to ensure valid image URLs
      const transformedItems = response.data.items?.map((item: any) => {
        // Check if item and item.book exist
        if (!item || !item.book) {
          console.warn('Invalid cart item found:', item);
          return item; // Return the item as is if it's invalid
        }

        return {
          ...item,
          book: {
            ...item.book,
            coverImage: bookService.ensureValidImageUrl(item.book.coverImage)
          }
        };
      }).filter(Boolean) || []; // Filter out any null/undefined items

      return {
        success: true,
        message: 'Item removed from cart',
        items: transformedItems,
        totalItems: response.data.totalItems || transformedItems.length,
        totalPrice: response.data.totalPrice || 0
      };
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to remove item from cart',
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }
  },

  /**
   * Clear the cart
   * @returns Promise with empty cart
   */
  clearCart: async (): Promise<CartResponse> => {
    try {
      await apiClient.delete('/Cart');

      return {
        success: true,
        message: 'Cart cleared',
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to clear cart',
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }
  }
};
