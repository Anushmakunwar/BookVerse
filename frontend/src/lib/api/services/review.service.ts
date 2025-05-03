import { apiClient } from '../client';
import { ReviewResponse, ReviewDetailResponse, ReviewListResponse, CreateReviewInput, UpdateReviewInput } from '../types';

/**
 * Review service for handling review-related operations
 */
export const reviewService = {
  /**
   * Get reviews for a specific book
   * @param bookId - Book ID
   * @returns Promise with reviews data
   */
  getBookReviews: async (bookId: number): Promise<ReviewListResponse> => {
    try {
      const response = await apiClient.get(`/Review/book/${bookId}`);

      return {
        success: true,
        reviews: response.data.reviews || []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reviews',
        reviews: []
      };
    }
  },

  /**
   * Get reviews by the current user
   * @returns Promise with user's reviews
   */
  getUserReviews: async (): Promise<ReviewListResponse> => {
    try {
      const response = await apiClient.get('/Review/user');

      return {
        success: true,
        reviews: response.data.reviews || []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your reviews',
        reviews: []
      };
    }
  },

  /**
   * Get a specific review by ID
   * @param reviewId - Review ID
   * @returns Promise with review details
   */
  getReviewById: async (reviewId: number): Promise<ReviewDetailResponse> => {
    try {
      const response = await apiClient.get(`/Review/${reviewId}`);

      return {
        success: true,
        review: response.data.review
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch review',
        review: null
      };
    }
  },

  /**
   * Create a new review
   * @param reviewData - Review data to submit
   * @returns Promise with created review
   */
  createReview: async (reviewData: CreateReviewInput): Promise<ReviewDetailResponse> => {
    try {
      const response = await apiClient.post('/Review', reviewData);

      return {
        success: true,
        message: 'Review submitted successfully',
        review: response.data.review
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit review',
        review: null
      };
    }
  },

  /**
   * Update an existing review
   * @param reviewId - Review ID to update
   * @param reviewData - Updated review data
   * @returns Promise with updated review
   */
  updateReview: async (reviewId: number, reviewData: UpdateReviewInput): Promise<ReviewDetailResponse> => {
    try {
      const response = await apiClient.put(`/Review/${reviewId}`, reviewData);

      return {
        success: true,
        message: 'Review updated successfully',
        review: response.data.review
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update review',
        review: null
      };
    }
  },

  /**
   * Delete a review
   * @param reviewId - Review ID to delete
   * @returns Promise with deletion result
   */
  deleteReview: async (reviewId: number): Promise<ReviewResponse> => {
    try {
      await apiClient.delete(`/Review/${reviewId}`);

      return {
        success: true,
        message: 'Review deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete review'
      };
    }
  },

  /**
   * Check if the current user has purchased a specific book
   * @param bookId - Book ID to check
   * @returns Promise with purchase status
   */
  checkBookPurchase: async (bookId: number): Promise<{ success: boolean; hasPurchased: boolean; message?: string }> => {
    try {
      // Check if user is authenticated by checking if user data exists in localStorage
      const storedUser = localStorage.getItem('bookstore_user');
      if (!storedUser) {
        console.log('Purchase check failed: User not authenticated (no user data in localStorage)');
        return {
          success: false,
          hasPurchased: false,
          message: 'User not authenticated'
        };
      }

      console.log(`Checking purchase status for book ID: ${bookId}`);
      const response = await apiClient.get(`/Review/check-purchase/${bookId}`);

      // Log the full response for debugging
      console.log('Purchase check response:', response.data);

      // Check if the response has the expected structure
      if (response.data && typeof response.data.hasPurchased === 'boolean') {
        const hasPurchased = response.data.hasPurchased;
        console.log(`Purchase check result: User ${hasPurchased ? 'has' : 'has not'} purchased book ${bookId}`);

        return {
          success: true,
          hasPurchased: hasPurchased,
          message: response.data.message
        };
      } else {
        // Handle unexpected response format
        console.warn('Unexpected response format from purchase check:', response.data);
        return {
          success: false,
          hasPurchased: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error: any) {
      // More detailed error handling
      console.error('Purchase check error:', error);
      console.error('Error details:', error.response?.data);

      // Handle authentication errors
      if (error.response?.status === 401) {
        return {
          success: false,
          hasPurchased: false,
          message: 'Authentication required'
        };
      }

      return {
        success: false,
        hasPurchased: false,
        message: error.response?.data?.message || 'Failed to check purchase status'
      };
    }
  },

  /**
   * Force refresh the purchase status for a book
   * @param bookId - Book ID to check
   * @returns Promise with refreshed purchase status
   */
  refreshPurchaseStatus: async (bookId: number): Promise<{ success: boolean; hasPurchased: boolean; message?: string }> => {
    try {
      // Check if user is authenticated by checking if user data exists in localStorage
      const storedUser = localStorage.getItem('bookstore_user');
      if (!storedUser) {
        console.log('Purchase status refresh failed: User not authenticated (no user data in localStorage)');
        return {
          success: false,
          hasPurchased: false,
          message: 'User not authenticated'
        };
      }

      console.log(`Force refreshing purchase status for book ID: ${bookId}`);

      // First try the refresh endpoint if it exists
      try {
        const response = await apiClient.post(`/Review/refresh-purchase-status/${bookId}`);

        // Log the full response for debugging
        console.log('Purchase status refresh response:', response.data);

        // Check if the response has the expected structure
        if (response.data && typeof response.data.hasPurchased === 'boolean') {
          const hasPurchased = response.data.hasPurchased;
          console.log(`Refreshed purchase status: User ${hasPurchased ? 'has' : 'has not'} purchased book ${bookId}`);

          return {
            success: true,
            hasPurchased: hasPurchased,
            message: response.data.message
          };
        }
      } catch (refreshError) {
        // If the refresh endpoint doesn't exist or fails, fall back to the regular check endpoint
        console.log('Refresh endpoint failed, falling back to regular check endpoint:', refreshError);
      }

      // Fall back to regular check endpoint
      const checkResponse = await apiClient.get(`/Review/check-purchase/${bookId}?_t=${Date.now()}`);

      // Log the full response for debugging
      console.log('Fallback purchase check response:', checkResponse.data);

      // Check if the response has the expected structure
      if (checkResponse.data && typeof checkResponse.data.hasPurchased === 'boolean') {
        const hasPurchased = checkResponse.data.hasPurchased;
        console.log(`Fallback purchase check result: User ${hasPurchased ? 'has' : 'has not'} purchased book ${bookId}`);

        return {
          success: true,
          hasPurchased: hasPurchased,
          message: checkResponse.data.message || 'Purchase status refreshed'
        };
      } else {
        // Handle unexpected response format
        console.warn('Unexpected response format from purchase status check:', checkResponse.data);
        return {
          success: false,
          hasPurchased: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error: any) {
      // More detailed error handling
      console.error('Purchase status refresh error:', error);
      console.error('Error details:', error.response?.data);

      // Handle authentication errors
      if (error.response?.status === 401) {
        return {
          success: false,
          hasPurchased: false,
          message: 'Authentication required'
        };
      }

      return {
        success: false,
        hasPurchased: false,
        message: error.response?.data?.message || 'Failed to refresh purchase status'
      };
    }
  }
};
