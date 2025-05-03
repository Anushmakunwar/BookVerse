import { apiClient } from '../client';
import { OrderResponse, OrderDetailResponse, OrderListResponse } from '../types';
import { bookService } from './book.service';

/**
 * Order service for handling order-related operations
 */
export const orderService = {
  /**
   * Get the current user's orders
   * @returns Promise with orders data
   */
  getOrders: async (): Promise<OrderListResponse> => {
    try {
      const response = await apiClient.get('/Order');

      // Transform the order items to ensure valid image URLs
      const transformedOrders = response.data.orders?.map((order: any) => ({
        ...order,
        items: order.items?.map((item: any) => ({
          ...item,
          coverImage: bookService.ensureValidImageUrl(item.coverImage)
        }))
      })) || [];

      return {
        success: true,
        orders: transformedOrders
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
        orders: []
      };
    }
  },

  /**
   * Get a specific order by ID
   * @param orderId - Order ID
   * @returns Promise with order details
   */
  getOrderById: async (orderId: number): Promise<OrderDetailResponse> => {
    try {
      const response = await apiClient.get(`/Order/${orderId}`);

      // Transform the order items to ensure valid image URLs
      const transformedOrder = {
        ...response.data.order,
        items: response.data.order.items?.map((item: any) => ({
          ...item,
          coverImage: bookService.ensureValidImageUrl(item.coverImage)
        }))
      };

      return {
        success: true,
        order: transformedOrder
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to fetch order #${orderId}`,
        order: null
      };
    }
  },

  /**
   * Create a new order from the cart
   * @param note - Optional order note
   * @returns Promise with created order
   */
  createOrder: async (note?: string): Promise<OrderDetailResponse> => {
    try {
      const payload = note ? { note } : {};
      const response = await apiClient.post('/Order', payload);

      // Transform the order items to ensure valid image URLs
      const transformedOrder = {
        ...response.data.order,
        items: response.data.order.items?.map((item: any) => ({
          ...item,
          coverImage: bookService.ensureValidImageUrl(item.coverImage)
        }))
      };

      return {
        success: true,
        message: 'Order created successfully',
        order: transformedOrder
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order',
        order: null
      };
    }
  },

  /**
   * Cancel an order
   * @param orderId - Order ID to cancel
   * @returns Promise with cancellation result
   */
  cancelOrder: async (orderId: number): Promise<OrderResponse> => {
    try {
      const response = await apiClient.post(`/Order/${orderId}/cancel`);

      return {
        success: true,
        message: 'Order cancelled successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to cancel order #${orderId}`
      };
    }
  },

  /**
   * Process an order (staff/admin only)
   * @param claimCode - Order claim code
   * @param membershipId - Member's ID
   * @returns Promise with processing result
   */
  processOrder: async (claimCode: string, membershipId: string): Promise<OrderDetailResponse> => {
    try {
      const response = await apiClient.post('/Order/process', {
        claimCode,
        membershipId
      });

      // Transform the order items to ensure valid image URLs
      const transformedOrder = {
        ...response.data.order,
        items: response.data.order.items?.map((item: any) => ({
          ...item,
          coverImage: bookService.ensureValidImageUrl(item.coverImage)
        }))
      };

      return {
        success: true,
        message: 'Order processed successfully',
        order: transformedOrder
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process order',
        order: null
      };
    }
  },

  /**
   * Get all orders (staff/admin only)
   * @param processed - Optional filter for processed status
   * @returns Promise with all orders
   */
  getAllOrders: async (processed?: boolean): Promise<OrderListResponse> => {
    try {
      const url = processed !== undefined
        ? `/Order/all?processed=${processed}`
        : '/Order/all';

      console.log(`Fetching orders with URL: ${url}`);
      const response = await apiClient.get(url);
      console.log('Orders API response:', response.data);

      // Handle different response formats
      let ordersData = [];
      if (Array.isArray(response.data)) {
        // If the API returns an array directly
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data.orders)) {
        // If the API returns an object with an orders property
        ordersData = response.data.orders;
      }

      // Transform the order items to ensure valid image URLs
      const transformedOrders = ordersData.map((order: any) => ({
        ...order,
        items: order.items?.map((item: any) => ({
          ...item,
          coverImage: bookService.ensureValidImageUrl(item.coverImage)
        })) || []
      })) || [];

      console.log('Transformed orders:', transformedOrders);
      return {
        success: true,
        orders: transformedOrders
      };
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch all orders',
        orders: []
      };
    }
  }
};
