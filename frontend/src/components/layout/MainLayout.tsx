'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useCurrentUser } from '@/lib/react-query/hooks/useAuth';
import { useCart, useBookmarks } from '@/hooks/useStore';
import { useCart as useCartQuery } from '@/lib/react-query/hooks/useCart';
import { useBookmarks as useBookmarksQuery } from '@/lib/react-query/hooks/useBookmarks';
import { getRouteGroup } from '@/lib/routes';

/**
 * MainLayout props interface
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout component provides the main layout for the application
 * Includes header and footer
 * 
 * @example
 * ```tsx
 * <MainLayout>
 *   <Component {...pageProps} />
 * </MainLayout>
 * ```
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const routeGroup = getRouteGroup(pathname || '');
  
  const { data: userData } = useCurrentUser();
  const isAuthenticated = !!userData?.user;
  
  const { data: cartData } = useCartQuery();
  const { setCart } = useCart();
  
  const { data: bookmarksData } = useBookmarksQuery();
  const { setBookmarks } = useBookmarks();

  // Sync cart data from API to store
  useEffect(() => {
    if (cartData?.success && cartData.items) {
      setCart(cartData.items);
    }
  }, [cartData, setCart]);

  // Sync bookmarks data from API to store
  useEffect(() => {
    if (bookmarksData?.success && bookmarksData.bookmarks) {
      setBookmarks(bookmarksData.bookmarks);
    }
  }, [bookmarksData, setBookmarks]);

  // Don't show header/footer for auth pages
  if (routeGroup === 'auth') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
