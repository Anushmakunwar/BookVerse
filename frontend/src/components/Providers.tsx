'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { BookmarkProvider } from '@/context/BookmarkContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Layout from './Layout';
import { queryClient } from '@/lib/react-query';
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Global providers for the application
 * Includes:
 * - React Query
 * - Authentication
 * - Cart
 * - Bookmarks
 * - Toast notifications
 */
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const pathname = usePathname();
  const isStaffPage = pathname?.startsWith('/staff');
  const isAdminPage = pathname?.startsWith('/admin');
  const skipMainLayout = isStaffPage || isAdminPage;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BookmarkProvider>
            <NotificationProvider>
              {skipMainLayout ? (
                // Don't wrap staff or admin pages with Layout
                <>
                  {children}
                  <Toaster position="top-right" />
                </>
              ) : (
                // Wrap regular pages with Layout
                <>
                  <Layout>{children}</Layout>
                  <Toaster position="top-right" />
                </>
              )}
            </NotificationProvider>
          </BookmarkProvider>
        </CartProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default Providers;
