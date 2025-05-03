import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

export const API_URL = 'http://localhost:5261/api';

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Creates an API client with the given configuration
 */
export const createApiClient = (config?: ApiClientConfig): AxiosInstance => {
  const client = axios.create({
    baseURL: config?.baseURL || API_URL,
    timeout: config?.timeout || 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config?.headers,
    },
    withCredentials: true,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // The application uses cookie-based authentication, so we don't need to add
      // an Authorization header. The withCredentials: true setting ensures cookies
      // are sent with cross-origin requests.

      // For debugging, check if we have cookies
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const cookies = document.cookie;
        if (!cookies && !config.url?.includes('/Auth/')) {
          console.log('No cookies found for request:', config.url);
        }
      }

      // Only log in development and not for Auth/me requests to reduce noise
      if (process.env.NODE_ENV === 'development' && !config.url?.includes('/Auth/me')) {
        console.log('Starting Request', {
          url: config.url,
          method: config.method,
          data: config.data,
        });
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Only log in development and not for Auth/me responses to reduce noise
      if (process.env.NODE_ENV === 'development' && !response.config.url?.includes('/Auth/me')) {
        console.log('Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        });
      }
      return response;
    },
    async (error: AxiosError) => {
      // Special handling for Auth/me endpoint with 401 status
      if (error.response?.status === 401 && error.config?.url?.includes('/Auth/me')) {
        console.log('User not authenticated - silently handling 401 from /Auth/me');
        return Promise.resolve({
          data: {
            success: false,
            message: 'Not authenticated',
            user: null,
          },
        } as AxiosResponse);
      }

      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      // Handle 500 Internal Server Error
      if (error.response?.status === 500) {
        return Promise.resolve({
          data: {
            success: false,
            message: 'Server error occurred',
            serverError: true,
          },
        } as AxiosResponse);
      }

      // Handle 401 Unauthorized (not for Auth endpoints)
      if (error.response?.status === 401 && !error.config?.url?.includes('/Auth/')) {
        return Promise.resolve({
          data: {
            success: false,
            message: 'Authentication required',
            authError: true,
          },
        } as AxiosResponse);
      }

      // Handle network errors with retry
      if (error.message?.includes('Network Error') && error.config && !error.config._retry) {
        console.log('Network error detected, retrying request...');
        const config = { ...error.config, _retry: true } as AxiosRequestConfig;
        try {
          return await axios(config);
        } catch (retryError) {
          console.error('Retry failed:', retryError);

          // For book-related GET endpoints (except stats and admin-stats), return empty results
          if (error.config?.url?.includes('/Books') &&
              error.config?.method === 'get' &&
              !error.config?.url?.includes('/Books/stats') &&
              !error.config?.url?.includes('/Books/admin-stats')) {
            return Promise.resolve({
              data: [],
            } as AxiosResponse);
          }
        }
      }

      // For book-related GET endpoints (except stats and admin-stats), return empty results
      if (error.config?.url?.includes('/Books') &&
          error.config?.method === 'get' &&
          !error.config?.url?.includes('/Books/stats') &&
          !error.config?.url?.includes('/Books/admin-stats')) {
        return Promise.resolve({
          data: [],
        } as AxiosResponse);
      }

      // For other errors, reject with standardized error
      return Promise.reject({
        ...error,
        message: error.response?.data?.message || error.message || 'An error occurred',
      });
    }
  );

  return client;
};

// Create default API client
export const apiClient = createApiClient();

/**
 * Generic API request function with type safety
 */
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return {
      data: response.data,
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred',
      error,
    };
  }
};
