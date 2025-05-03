import { apiClient } from '../client';
import { Book, BookDetailResponse, BookInput, BookListResponse, BookSearchParams } from '../types';

/**
 * Utility function to ensure image URLs are valid
 * @param imageUrl - The image URL to validate
 * @returns A valid image URL or null
 */
const ensureValidImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  // If it's already a valid URL, return it
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch (e) {
    // If it's a relative path starting with /uploads, it's a file uploaded to the server
    if (imageUrl.startsWith('/uploads/')) {
      // Use the backend URL directly
      return `http://localhost:5261${imageUrl}`;
    }
    // If it's another relative path, convert it to an absolute URL
    else if (imageUrl.startsWith('/')) {
      return `http://localhost:5261${imageUrl}`;
    }
    // If it doesn't start with '/', add the leading slash
    return `http://localhost:5261/${imageUrl}`;
  }
};

/**
 * Transform a book object from the API to a standardized format
 * @param bookData - The book data from the API
 * @returns A standardized book object
 */
const transformBookData = (bookData: any): Book => {
  return {
    id: bookData.id || bookData.Id,
    title: bookData.title || bookData.Title,
    author: bookData.author || bookData.Author,
    description: bookData.description || bookData.Description || '',
    price: bookData.price || bookData.Price || 0,
    coverImage: ensureValidImageUrl(bookData.coverImage || bookData.CoverImage),
    genre: bookData.genre || bookData.Genre || 'Unknown',
    language: bookData.language || bookData.Language || 'English',
    format: bookData.format || bookData.Format || 'Paperback',
    publisher: bookData.publisher || bookData.Publisher || '',
    isAvailableInLibrary: bookData.isAvailableInLibrary || bookData.IsAvailableInLibrary || false,
    inventoryCount: bookData.inventoryCount || bookData.InventoryCount || 0,
    totalSold: bookData.totalSold || bookData.TotalSold || 0,
    averageRating: bookData.averageRating || bookData.AverageRating || 0,
    publishedDate: bookData.publishedDate || bookData.PublishedDate || new Date().toISOString(),
    isbn: bookData.isbn || bookData.ISBN || '',
    isOnSale: bookData.isOnSale || bookData.IsOnSale || false,
    discountPrice: bookData.discountPrice || bookData.DiscountdPrice || null
  };
};

/**
 * Book service for handling book-related operations
 */
export const bookService = {
  /**
   * Get all books
   * @param page - Page number (optional)
   * @param pageSize - Page size (optional)
   * @returns Promise with book list
   */
  getAllBooks: async (page = 1, pageSize = 10): Promise<BookListResponse> => {
    try {
      // Add a cache-busting parameter for admin requests (large page sizes)
      const params: any = { page, pageSize };
      if (pageSize >= 100) {
        // Add a timestamp to prevent caching for admin requests
        params._t = Date.now();
      }

      const response = await apiClient.get('/Books', { params });

      // Check if the response has the new structure with Data property
      const booksData = response.data.Data || response.data;

      // Transform the response to match our expected format
      const transformedBooks = Array.isArray(booksData)
        ? booksData.map(transformBookData)
        : [];

      return {
        success: true,
        books: transformedBooks,
        totalCount: response.data.TotalCount || response.data.totalCount || transformedBooks.length,
        pageCount: response.data.PageCount || response.data.pageCount || 1
      };
    } catch (error: any) {
      console.error('Error fetching books:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch books',
        books: []
      };
    }
  },

  /**
   * Get a book by ID
   * @param id - Book ID
   * @returns Promise with book details
   */
  getBookById: async (id: number): Promise<BookDetailResponse> => {
    try {
      const response = await apiClient.get(`/Books/${id}`);
      console.log('Raw book details response:', response.data);

      // Check if the response has the new structure with Data property
      const bookData = response.data.Data || response.data;

      // Transform the response to match our expected format
      const book = bookData ? transformBookData(bookData) : null;

      console.log('Transformed book details:', book);

      return {
        success: true,
        book
      };
    } catch (error: any) {
      console.error(`Error fetching book ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch book details',
        book: null
      };
    }
  },

  /**
   * Search for books
   * @param params - Search parameters
   * @returns Promise with search results
   */
  searchBooks: async (params: BookSearchParams): Promise<BookListResponse> => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/Books/search?${queryParams.toString()}`);
      console.log('Raw search response:', response.data);

      // Check if the response has the new structure with Data property
      const booksData = response.data.Data || response.data;

      // Transform the response to match our expected format
      const transformedBooks = Array.isArray(booksData)
        ? booksData.map(transformBookData)
        : [];

      console.log('Transformed search results:', transformedBooks);

      return {
        success: true,
        books: transformedBooks,
        totalCount: response.data.TotalCount || response.data.totalCount || transformedBooks.length,
        pageCount: response.data.PageCount || response.data.pageCount || 1
      };
    } catch (error: any) {
      console.error('Error searching books:', error);
      return {
        success: false,
        message: error.message || 'Failed to search books',
        books: []
      };
    }
  },

  /**
   * Add a new book (admin only)
   * @param bookData - Book data
   * @returns Promise with added book
   */
  addBook: async (bookData: BookInput): Promise<BookDetailResponse> => {
    try {
      const response = await apiClient.post('/Books', bookData);
      console.log('Raw add book response:', response.data);

      // The response might have a Data property that contains the actual book data
      const bookResponseData = response.data.Data || response.data;

      // Transform the book data to our standard format
      const transformedBook = transformBookData(bookResponseData);
      console.log('Transformed book:', transformedBook);

      return {
        success: true,
        book: transformedBook
      };
    } catch (error: any) {
      console.error('Error adding book:', error);
      return {
        success: false,
        message: error.message || 'Failed to add book',
        book: null
      };
    }
  },

  /**
   * Update an existing book (admin only)
   * @param id - Book ID
   * @param bookData - Updated book data
   * @returns Promise with update result
   */
  updateBook: async (id: number, bookData: Partial<BookInput>): Promise<BookDetailResponse> => {
    try {
      const response = await apiClient.put(`/Books/${id}`, bookData);
      console.log('Raw update book response:', response.data);

      // The response might have a Data property that contains the actual book data
      const bookResponseData = response.data.Data || response.data;

      // Transform the book data to our standard format
      const transformedBook = transformBookData(bookResponseData);
      console.log('Transformed updated book:', transformedBook);

      return {
        success: true,
        book: transformedBook
      };
    } catch (error: any) {
      console.error(`Error updating book ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to update book',
        book: null
      };
    }
  },

  /**
   * Delete a book (admin only)
   * @param id - Book ID
   * @returns Promise with delete result
   */
  deleteBook: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.delete(`/Books/${id}`);

      console.log('Delete book response:', response.status, response.statusText);

      return {
        success: true,
        message: 'Book deleted successfully'
      };
    } catch (error: any) {
      console.error(`Error deleting book ${id}:`, error);

      // Extract more detailed error information
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.Message ||
                          error.message ||
                          'Failed to delete book';

      const statusCode = error.response?.status;
      const statusText = error.response?.statusText;

      // Log detailed error information
      console.error('Delete book error details:', {
        statusCode,
        statusText,
        errorMessage,
        responseData: error.response?.data
      });

      return {
        success: false,
        message: statusCode ? `Failed to delete book: ${statusCode} ${statusText}` : errorMessage
      };
    }
  },

  /**
   * Upload a book cover image
   * @param bookId - Book ID
   * @param file - Image file
   * @returns Promise with upload result
   */
  uploadBookCover: async (
    bookId: number,
    file: File
  ): Promise<{ success: boolean; message?: string; coverImagePath?: string }> => {
    try {
      console.log(`Uploading cover image for book ID ${bookId}, file:`, file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`/Books/${bookId}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data);

      // Check if the response contains a coverImagePath
      if (response.data && response.data.coverImagePath) {
        console.log('Cover image path:', response.data.coverImagePath);
        return {
          success: true,
          coverImagePath: response.data.coverImagePath
        };
      } else {
        console.error('No coverImagePath in response:', response.data);
        return {
          success: false,
          message: 'No cover image path returned from server'
        };
      }
    } catch (error: any) {
      console.error(`Error uploading cover for book ${bookId}:`, error);
      console.error('Error details:', error.response?.data || 'No response data');
      return {
        success: false,
        message: error.response?.data || error.message || 'Failed to upload book cover'
      };
    }
  },

  /**
   * Delete a book cover image
   * @param bookId - Book ID
   * @returns Promise with delete result
   */
  deleteBookCover: async (
    bookId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.delete(`/Books/${bookId}/cover`);

      return {
        success: true,
        message: 'Book cover deleted successfully'
      };
    } catch (error: any) {
      console.error(`Error deleting cover for book ${bookId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to delete book cover'
      };
    }
  },

  // Export the utility function for use in components
  ensureValidImageUrl
};
