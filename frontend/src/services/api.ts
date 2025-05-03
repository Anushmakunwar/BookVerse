import axios from 'axios';

const API_URL = 'http://localhost:5261/api';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add a longer timeout to prevent network errors
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  // Only log in development and not for Auth/me requests to reduce noise
  if (process.env.NODE_ENV === 'development' && !request.url?.includes('/Auth/me')) {
    console.log('Starting Request', request);
  }
  return request;
});

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  response => {
    // Only log in development and not for Auth/me responses to reduce noise
    if (process.env.NODE_ENV === 'development' && !response.config.url?.includes('/Auth/me')) {
      console.log('Response:', response);
      // Log cookies if they exist in the response
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        console.log('Response cookies:', cookies);
      }
      // Log all cookies in the browser
      console.log('All cookies:', document.cookie);
    }
    return response;
  },
  async error => {
    // Special handling for Auth/me endpoint with 401 status
    // This is expected when user is not logged in, so we'll handle it silently
    if (error.response?.status === 401 &&
        error.config?.url?.includes('/Auth/me')) {
      console.log('User not authenticated - silently handling 401 from /Auth/me');
      return Promise.resolve({
        data: {
          success: false,
          message: 'Not authenticated',
          user: null
        }
      });
    }

    // For other errors, log them in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        // Don't log the entire request object as it can be circular
        console.error('No response received from server');
      } else {
        console.error('Error message:', error.message);
      }

      // Only log config if it exists and is not circular
      if (error.config) {
        try {
          const safeConfig = {
            url: error.config.url,
            method: error.config.method,
            timeout: error.config.timeout
          };
          console.error('Error config:', safeConfig);
        } catch (e) {
          console.error('Could not log error config');
        }
      }
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error (500):', error.config?.url);
      // Return a standardized error response instead of rejecting
      return Promise.resolve({
        data: {
          success: false,
          message: 'Server error occurred',
          serverError: true
        }
      });
    }

    // If the error is due to authentication (401) and it's not an auth endpoint
    if (error.response?.status === 401 &&
        !error.config.url.includes('/Auth/')) {
      console.log('Authentication error, will be handled by the component');
      // Don't redirect here, let the component handle it
      // Just return a standardized error response
      return Promise.resolve({
        data: {
          success: false,
          message: 'Authentication required',
          authError: true
        }
      });
    }

    // If the error is a network error, retry the request once
    if (error.message && error.message.includes('Network Error') && !error.config._retry) {
      console.log('Network error detected, retrying request...');
      error.config._retry = true;
      try {
        return await axios(error.config);
      } catch (retryError) {
        console.error('Retry failed:', retryError);

        // For book-related endpoints, return empty results instead of rejecting
        if (error.config?.url?.includes('/Books')) {
          console.log('Returning empty book results after network error');
          return Promise.resolve({
            data: []
          });
        }
      }
    }

    // For book-related endpoints, return empty results instead of rejecting
    if (error.config?.url?.includes('/Books')) {
      console.log('Returning empty book results after error');
      return Promise.resolve({
        data: []
      });
    }

    // For other endpoints, reject with a standardized error
    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message || 'An error occurred'
    });
  }
);

// Auth services
export const authService = {
  register: async (fullName: string, email: string, password: string) => {
    try {
      const response = await api.post('/Auth/register', { fullName, email, password });
      console.log('Register response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  },
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login with credentials:', { email });
      const response = await api.post('/Auth/login', { email, password });
      console.log('Login response:', response);

      // Check for cookies in the response headers
      const cookies = document.cookie;
      console.log('Cookies after login:', cookies);

      // Add a small delay to ensure cookies are properly set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify the cookie was set
      const cookiesAfterDelay = document.cookie;
      console.log('Cookies after delay:', cookiesAfterDelay);

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/Auth/logout');
      console.log('Logout response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.message || 'Logout failed'
      };
    }
  },
  getCurrentUser: async () => {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        // Check if there are any cookies set
        if (!document.cookie) {
          console.log('No cookies found, user is likely not authenticated');
        } else {
          console.log('Cookies found, checking authentication...');
        }
      }

      // Even if there are no cookies, still make the request
      // Our interceptor will handle the 401 error gracefully
      const response = await api.get('/Auth/me');

      // If we get here, the request was successful
      if (process.env.NODE_ENV === 'development') {
        console.log('User authenticated successfully');
      }

      return response.data;
    } catch (error: any) {
      // This should rarely happen now that we handle 401 in the interceptor
      // But we'll keep it for other types of errors

      // If there's a network error, handle it gracefully
      if (error.message && error.message.includes('Network Error')) {
        console.warn('Network error when checking authentication');
        return {
          success: false,
          message: 'Network error when checking authentication',
          user: null
        };
      }

      // For any other errors
      console.warn('Error in getCurrentUser:', error.message || 'Unknown error');
      return {
        success: false,
        message: error.message || 'Failed to get current user',
        user: null
      };
    }
  },
};

// Book services
export const bookService = {
  // Helper function to ensure coverImage is a valid URL
  ensureValidImageUrl: (imageUrl: string | null | undefined): string | null => {
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
  },

  getAllBooks: async () => {
    try {
      const response = await api.get('/Books');
      console.log('Raw books response:', response.data);

      // Check if the response has the new structure with Data property
      const booksData = response.data.Data || response.data;

      // Transform the response to match our expected format with lowercase property names
      const transformedBooks = Array.isArray(booksData) ? booksData.map(book => {
        // Process the cover image URL
        let coverImage = book.coverImage || book.CoverImage || null;
        if (coverImage) {
          coverImage = bookService.ensureValidImageUrl(coverImage);
        }

        return {
          id: book.id || book.Id,
          title: book.title || book.Title,
          author: book.author || book.Author,
          price: book.price || book.Price || 0,
          coverImage,
          genre: book.genre || book.Genre || 'Unknown',
          language: book.language || book.Language || 'English',
          format: book.format || book.Format || 'Paperback',
          publisher: book.publisher || book.Publisher || '',
          isAvailableInLibrary: book.isAvailableInLibrary || book.IsAvailableInLibrary || false,
          inventoryCount: book.inventoryCount || book.InventoryCount || 0,
          totalSold: book.totalSold || book.TotalSold || 0,
          averageRating: book.averageRating || book.AverageRating || 0,
          publishedDate: book.publishedDate || book.PublishedDate || new Date().toISOString(),
          isbn: book.isbn || book.ISBN || '',
          isOnSale: book.isOnSale || book.IsOnSale || false,
          discountPrice: book.discountPrice || book.DiscountdPrice || null
        };
      }) : [];

      console.log('Transformed books:', transformedBooks);

      return {
        success: true,
        books: transformedBooks
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
  getBookById: async (id: number) => {
    try {
      const response = await api.get(`/Books/${id}`);
      console.log('Raw book details response:', response.data);

      // Check if the response has the new structure with Data property
      const bookData = response.data.Data || response.data;

      // Transform the response to match our expected format with lowercase property names
      const book = bookData ? {
        id: bookData.id || bookData.Id,
        title: bookData.title || bookData.Title,
        author: bookData.author || bookData.Author,
        price: bookData.price || bookData.Price || 0,
        coverImage: bookService.ensureValidImageUrl(bookData.coverImage || bookData.CoverImage),
        description: bookData.description || bookData.Description || '',
        genre: bookData.genre || bookData.Genre || 'Unknown',
        publishedDate: bookData.publishedDate || bookData.PublishedDate || new Date().toISOString(),
        language: bookData.language || bookData.Language || 'English',
        format: bookData.format || bookData.Format || 'Paperback',
        publisher: bookData.publisher || bookData.Publisher || '',
        isAvailableInLibrary: bookData.isAvailableInLibrary || bookData.IsAvailableInLibrary || false,
        inventoryCount: bookData.inventoryCount || bookData.InventoryCount || 0,
        totalSold: bookData.totalSold || bookData.TotalSold || 0,
        averageRating: bookData.averageRating || bookData.AverageRating || 0,
        isbn: bookData.isbn || bookData.ISBN || '',
        isOnSale: bookData.isOnSale || bookData.IsOnSale || false,
        discountPrice: bookData.discountPrice || bookData.DiscountdPrice || null
      } : null;

      console.log('Transformed book details:', book);

      return {
        success: true,
        book: book
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
  searchBooks: async (params: {
    keyword?: string;
    sortBy?: string;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    author?: string;
    inStock?: boolean;
    inLibrary?: boolean;
    minRating?: number;
    language?: string;
    format?: string;
    publisher?: string;
    isbn?: string;
  }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await api.get(`/Books/search?${queryParams.toString()}`);
      console.log('Raw search response:', response.data);

      // Check if the response has the new structure with Data property
      const booksData = response.data.Data || response.data;

      // Transform the response to match our expected format with lowercase property names
      const transformedBooks = Array.isArray(booksData) ? booksData.map(book => ({
        id: book.id || book.Id,
        title: book.title || book.Title,
        author: book.author || book.Author,
        price: book.price || book.Price || 0,
        coverImage: bookService.ensureValidImageUrl(book.coverImage || book.CoverImage),
        genre: book.genre || book.Genre || 'Unknown',
        language: book.language || book.Language || 'English',
        format: book.format || book.Format || 'Paperback',
        publisher: book.publisher || book.Publisher || '',
        isAvailableInLibrary: book.isAvailableInLibrary || book.IsAvailableInLibrary || false,
        inventoryCount: book.inventoryCount || book.InventoryCount || 0,
        totalSold: book.totalSold || book.TotalSold || 0,
        averageRating: book.averageRating || book.AverageRating || 0,
        publishedDate: book.publishedDate || book.PublishedDate || new Date().toISOString(),
        isbn: book.isbn || book.ISBN || '',
        isOnSale: book.isOnSale || book.IsOnSale || false,
        discountPrice: book.discountPrice || book.DiscountdPrice || null
      })) : [];

      console.log('Transformed search results:', transformedBooks);

      return {
        success: true,
        books: transformedBooks
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

  // Admin book management methods
  addBook: async (bookData: any) => {
    try {
      const response = await api.post('/Books', bookData);
      return {
        success: true,
        book: response.data
      };
    } catch (error: any) {
      console.error('Error adding book:', error);
      return {
        success: false,
        message: error.message || 'Failed to add book'
      };
    }
  },

  uploadBookCover: async (bookId: number, file: File) => {
    try {
      console.log(`Uploading cover image for book ID ${bookId}, file:`, file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/Books/${bookId}/cover`, formData, {
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

  deleteBookCover: async (bookId: number) => {
    try {
      await api.delete(`/Books/${bookId}/cover`);
      return {
        success: true
      };
    } catch (error: any) {
      console.error(`Error deleting cover for book ${bookId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to delete book cover'
      };
    }
  },

  updateBook: async (id: number, bookData: any) => {
    try {
      const response = await api.put(`/Books/${id}`, bookData);
      return {
        success: true,
        book: response.data
      };
    } catch (error: any) {
      console.error(`Error updating book ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to update book'
      };
    }
  },

  deleteBook: async (id: number) => {
    try {
      await api.delete(`/Books/${id}`);
      return {
        success: true
      };
    } catch (error: any) {
      console.error(`Error deleting book ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to delete book'
      };
    }
  },
};

// Bookmark services
export const bookmarkService = {
  getBookmarks: async () => {
    try {
      console.log('Fetching bookmarks from API...');
      const response = await api.get('/Bookmark');
      console.log('Raw bookmark response:', response.data);

      // Ensure we have an array to work with
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        return {
          success: false,
          message: 'Invalid response format from server',
          bookmarks: []
        };
      }

      // Transform the response to match our expected format
      const bookmarks = response.data.map(bookmark => ({
        id: bookmark.id,
        bookId: bookmark.bookId,
        bookTitle: bookmark.bookTitle || 'Untitled Book',
        bookAuthor: bookmark.bookAuthor || 'Unknown Author',
        bookPrice: bookmark.bookPrice || 0,
        bookCoverImage: bookmark.bookCoverImage ? bookService.ensureValidImageUrl(bookmark.bookCoverImage) : null,
        bookDescription: bookmark.bookDescription || '',
        bookGenre: bookmark.bookGenre || '',
        bookLanguage: bookmark.bookLanguage || '',
        bookFormat: bookmark.bookFormat || '',
        bookPublisher: bookmark.bookPublisher || '',
        createdAt: bookmark.createdAt
      }));

      console.log('Transformed bookmarks:', bookmarks);

      return {
        success: true,
        bookmarks: bookmarks
      };
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch bookmarks',
        bookmarks: []
      };
    }
  },
  addBookmark: async (bookId: number) => {
    try {
      const response = await api.post('/Bookmark', { bookId });
      return {
        success: true,
        message: 'Bookmark added successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      return {
        success: false,
        message: error.message || 'Failed to add bookmark'
      };
    }
  },
  removeBookmark: async (bookmarkId: number) => {
    try {
      console.log(`Removing bookmark with ID: ${bookmarkId}`);
      const response = await api.delete(`/Bookmark/${bookmarkId}`);
      console.log('Bookmark removal response:', response.data);
      return {
        success: true,
        message: 'Bookmark removed successfully'
      };
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      // Even if we get an error, we'll consider it a success for the UI
      // This is because the bookmark might already be gone from the database
      if (error.response && error.response.status === 400) {
        console.log('Bookmark may already be removed, treating as success');
        return {
          success: true,
          message: 'Bookmark removed successfully'
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to remove bookmark'
      };
    }
  },
};

// Cart services
export const cartService = {
  getCart: async () => {
    try {
      const response = await api.get('/Cart');

      // Ensure the response has the expected format
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid cart response format:', response.data);
        return {
          success: false,
          message: 'Invalid response format',
          items: [],
          totalItems: 0,
          totalPrice: 0
        };
      }

      // Transform the response to ensure all fields are properly formatted
      const transformedItems = Array.isArray(response.data.items) ? response.data.items.map(item => ({
        id: item.id,
        bookId: item.bookId,
        bookTitle: item.bookTitle || 'Untitled Book',
        bookAuthor: item.bookAuthor || 'Unknown Author',
        price: item.price || 0,
        quantity: item.quantity || 1,
        totalPrice: item.totalPrice || item.price || 0,
        coverImage: item.coverImage || bookService.ensureValidImageUrl(item.coverImage) || null
      })) : [];

      return {
        success: true,
        items: transformedItems,
        totalItems: response.data.totalItems || transformedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: response.data.totalPrice || transformedItems.reduce((sum, item) => sum + item.totalPrice, 0)
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
  addToCart: async (bookId: number, quantity: number) => {
    try {
      const response = await api.post('/Cart', { bookId, quantity });
      return response.data || { success: true };
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to add to cart'
      };
    }
  },
  updateCartItem: async (cartItemId: number, quantity: number) => {
    try {
      const response = await api.put(`/Cart/${cartItemId}`, { quantity });
      return response.data || { success: true };
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        message: error.message || 'Failed to update cart item'
      };
    }
  },
  removeFromCart: async (cartItemId: number) => {
    try {
      const response = await api.delete(`/Cart/${cartItemId}`);
      return response.data || { success: true };
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to remove from cart'
      };
    }
  },
  clearCart: async () => {
    try {
      const response = await api.delete('/Cart');
      return response.data || { success: true };
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to clear cart'
      };
    }
  },
};

export default api;
