import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';
import { useUI } from '@/hooks/useStore';
import {
  useCurrentUser,
  useLogin as useLoginMutation,
  useLogout as useLogoutMutation,
  useRegister as useRegisterMutation,
  useIsAdmin as useIsAdminQuery,
  useIsAuthenticated as useIsAuthenticatedQuery
} from '@/lib/react-query/hooks/useAuth';

interface User {
  id: number;
  email: string;
  role: string;
  totalOrders?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showGlobalLoading, hideGlobalLoading } = useUI();

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      try {
        setLoading(true);

        // Check if we have auth data in localStorage
        const storedUser = localStorage.getItem('bookstore_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Set user from localStorage immediately to prevent flicker
            setUser(parsedUser);
            if (process.env.NODE_ENV === 'development') {
              console.log('User loaded from localStorage:', parsedUser);
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('bookstore_user');
          }
        }

        // Check if we have cookies set
        const hasCookies = document.cookie.includes('.AspNetCore.Identity.Application');
        if (process.env.NODE_ENV === 'development') {
          console.log('Cookies present:', hasCookies);
          console.log('All cookies:', document.cookie);
        }

        // Always verify with the server
        const response = await authService.getCurrentUser();

        if (response.success && response.user) {
          // Check if totalOrders has changed
          const storedTotalOrders = user?.totalOrders;
          const newTotalOrders = response.user.totalOrders;

          if (storedTotalOrders !== newTotalOrders) {
            console.log(`Total orders updated: ${storedTotalOrders} -> ${newTotalOrders}`);
          }

          // Update user data from server
          setUser(response.user);
          // Store in localStorage for persistence
          localStorage.setItem('bookstore_user', JSON.stringify(response.user));
          if (process.env.NODE_ENV === 'development') {
            console.log('User authenticated from server:', response.user);
          }

          // Check if user is staff and redirect to staff page if not already there
          if (response.user.role === 'Staff') {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/staff')) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Staff user detected, redirecting to staff dashboard');
              }
              router.push('/staff');
            }
          }
        } else {
          // If we have a stored user but the server says we're not authenticated,
          // check if it's due to a network error or if we're really logged out
          if (storedUser && !hasCookies) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Stored user exists but no auth cookies found - likely logged out');
            }
            // No cookies means we're definitely logged out
            setUser(null);
            localStorage.removeItem('bookstore_user');
          } else if (storedUser && response.message?.includes('Network')) {
            // Network error but we have a stored user - keep the user logged in
            if (process.env.NODE_ENV === 'development') {
              console.log('Network error but keeping stored user data');
            }
            // Don't clear the user here to prevent logout on network issues
          } else {
            // User is not authenticated - this is a normal state, not an error
            setUser(null);
            localStorage.removeItem('bookstore_user');
            if (process.env.NODE_ENV === 'development') {
              console.log('User not authenticated');
            }
          }
        }
      } catch (error) {
        // This should rarely happen now that we handle errors in the API service
        console.error('Unexpected error checking auth status:', error);

        // Check if the error is a network error or 401 Unauthorized
        const isNetworkError = (error as any)?.message?.includes('network');
        const isUnauthorized = (error as any)?.status === 401;

        if (isNetworkError) {
          // If it's a network error, keep the user from localStorage
          console.log('Network error, using stored user data');
          // We don't clear the user here to prevent logout on network issues
        } else if (isUnauthorized) {
          // If it's an unauthorized error, clear the user
          setUser(null);
          localStorage.removeItem('bookstore_user');
        } else {
          // For other errors, keep the user from localStorage if available
          const storedUser = localStorage.getItem('bookstore_user');
          if (!storedUser) {
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Set up an interval to periodically check auth status
    const intervalId = setInterval(checkAuthStatus, 60 * 1000); // Check every minute for more responsive updates

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Show global loading overlay
      showGlobalLoading('Logging in...');

      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting login with email:', email);
      }

      const response = await authService.login(email, password);

      if (response.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Login successful, fetching user details...');
        }

        // Add a small delay to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 300));

        // Fetch user details after successful login
        const userResponse = await authService.getCurrentUser();

        if (userResponse.success && userResponse.user) {
          // Set user in state
          setUser(userResponse.user);

          // Store user in localStorage for persistence
          localStorage.setItem('bookstore_user', JSON.stringify(userResponse.user));

          toast.success('Login successful');

          // Update loading message based on role
          if (userResponse.user.role === 'Admin') {
            showGlobalLoading('Preparing admin dashboard...');
          } else if (userResponse.user.role === 'Staff') {
            showGlobalLoading('Preparing staff dashboard...');
          }

          // Add a small delay to ensure the loading message is visible
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check user role for appropriate redirect
          if (userResponse.user.role === 'Admin') {
            // Admin users always go to admin dashboard, regardless of redirect URL
            if (process.env.NODE_ENV === 'development') {
              console.log('Admin user detected, redirecting to admin dashboard');
            }
            router.push('/admin');

            // Keep the loading overlay visible for a bit longer to prevent flickering
            // The loading overlay will be hidden after the admin page is loaded
            setTimeout(() => {
              hideGlobalLoading();
            }, 1000);
          } else if (userResponse.user.role === 'Staff') {
            // Staff users always go to staff dashboard, regardless of redirect URL
            if (process.env.NODE_ENV === 'development') {
              console.log('Staff user detected, redirecting to staff dashboard');
            }
            router.push('/staff');

            // Keep the loading overlay visible for a bit longer
            setTimeout(() => {
              hideGlobalLoading();
            }, 1000);
          } else {
            // For regular members, check for redirect URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');

            if (redirectUrl) {
              // Check if the redirect URL is appropriate for the user's role
              if (redirectUrl.startsWith('/staff') || redirectUrl.startsWith('/admin')) {
                // Don't allow members to access staff or admin pages
                if (process.env.NODE_ENV === 'development') {
                  console.log('Member attempting to access restricted area, redirecting to homepage');
                }
                router.push('/');
              } else {
                // Redirect to the original requested URL
                if (process.env.NODE_ENV === 'development') {
                  console.log('Redirecting to:', redirectUrl);
                }
                router.push(redirectUrl);
              }
            } else {
              // Default redirect for regular users
              if (process.env.NODE_ENV === 'development') {
                console.log('Regular user detected, redirecting to homepage');
              }
              router.push('/');
            }

            // Hide loading overlay for regular users after a short delay
            setTimeout(() => {
              hideGlobalLoading();
            }, 500);
          }

          return true;
        } else {
          console.warn('Failed to get user details after login');
          toast.error('Login successful but failed to get user details');
          hideGlobalLoading();
        }
      } else {
        toast.error(response.message || 'Login failed');
        hideGlobalLoading();
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      hideGlobalLoading();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting registration with email:', email);
      }

      const response = await authService.register(fullName, email, password);

      if (response.success) {
        toast.success('Registration successful! Please log in.');
        // Add a small delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 300));
        router.push('/login');
        return true;
      }

      toast.error(response.message || 'Registration failed');
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting to logout...');
      }

      // Always set user to null immediately for better UX
      setUser(null);

      // Clear user data from localStorage
      localStorage.removeItem('bookstore_user');

      const response = await authService.logout();

      if (response.success) {
        toast.success('Logged out successfully');
      } else {
        // Even if the API call fails, we'll still log the user out locally
        console.warn('Logout API call failed, but user was logged out locally');
        toast.success('Logged out successfully');
      }

      // Add a small delay before redirecting
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we'll still log the user out locally
      setUser(null);
      localStorage.removeItem('bookstore_user');
      toast.success('Logged out successfully');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
