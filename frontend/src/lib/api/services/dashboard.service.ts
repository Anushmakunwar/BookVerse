import { apiClient } from '../client';
import { bookService } from './book.service';
import { orderService } from './order.service';

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalBooks: number;
  totalSold: number;
  totalInStock: number;
  topSellingBooks: Array<{
    id: number;
    title: string;
    totalSold: number;
  }>;
}

/**
 * Dashboard service for fetching admin dashboard statistics
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   * @returns Promise with dashboard statistics
   */
  getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats; message?: string }> => {
    try {
      // Fetch statistics from the new dedicated endpoint
      console.log('Fetching dashboard stats from API using dedicated endpoint...');
      const response = await apiClient.get('/Books/admin-stats');
      console.log('Dashboard stats API response:', response);

      // Check if the response has the expected structure
      if (response.data && response.data.success && response.data.stats) {
        const statsData = response.data.stats;
        console.log('Parsed stats data:', statsData);

        // Log all property names to check for case sensitivity issues
        console.log('Stats data property names:', Object.keys(statsData));

        // Try to handle case sensitivity issues
        const totalBooks = statsData.totalBooks || statsData.TotalBooks || 0;
        const totalSold = statsData.totalSold || statsData.TotalSold || 0;
        const totalInStock = statsData.totalInStock || statsData.TotalInStock || 0;
        const rawTopSellingBooks = statsData.topSellingBooks || statsData.TopSellingBooks || [];

        console.log('Raw top selling books:', rawTopSellingBooks);

        // Handle both camelCase and PascalCase in the top selling books
        const topSellingBooks = Array.isArray(rawTopSellingBooks)
          ? rawTopSellingBooks.map(book => {
              // Extract book properties handling both camelCase and PascalCase
              const id = book.id || book.Id || 0;
              const title = book.title || book.Title || '';
              const totalSold = book.totalSold || book.TotalSold || 0;

              console.log('Processing book:', { id, title, totalSold });

              return { id, title, totalSold };
            })
          : [];

        console.log('Extracted values:', {
          totalBooks,
          totalSold,
          totalInStock,
          topSellingBooksLength: topSellingBooks.length
        });

        // Log the top selling books to see what's in them
        if (topSellingBooks.length > 0) {
          console.log('First processed top selling book:', topSellingBooks[0]);
          console.log('Top selling books property names:', Object.keys(topSellingBooks[0]));
        } else {
          console.log('No top selling books found or not an array');
        }

        // Create a safe version of top selling books with proper validation
        const safeTopSellingBooks = topSellingBooks.map(book => ({
          id: typeof book.id === 'number' ? book.id : 0,
          title: typeof book.title === 'string' && book.title ? book.title : `Book #${book.id || 0}`,
          totalSold: typeof book.totalSold === 'number' ? book.totalSold : 0
        }));

        console.log('Safe top selling books:', safeTopSellingBooks);

        return {
          success: true,
          stats: {
            totalBooks: totalBooks,
            totalSold: totalSold,
            totalInStock: totalInStock,
            topSellingBooks: safeTopSellingBooks
          }
        };
      } else if (Array.isArray(response.data)) {
        // Handle case where API client is returning an empty array due to error handling
        console.error('API returned an empty array instead of stats data');
        return {
          success: false,
          message: 'Failed to fetch dashboard statistics: API returned invalid data format',
          stats: {
            totalBooks: 0,
            totalSold: 0,
            totalInStock: 0,
            topSellingBooks: []
          }
        };
      }

      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from server');

    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch dashboard statistics',
        stats: {
          totalBooks: 0,
          totalSold: 0,
          totalInStock: 0,
          topSellingBooks: []
        }
      };
    }
  }
};
