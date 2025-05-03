'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBook } from 'react-icons/fa';
import { useCurrentUser } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';

/**
 * AuthLayout props interface
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout component provides the layout for authentication pages
 *
 * @example
 * ```tsx
 * <AuthLayout>
 *   <LoginForm />
 * </AuthLayout>
 * ```
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: userData } = useCurrentUser();
  const isAuthenticated = !!userData?.user;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if user is admin
      const isAdmin = userData?.user?.role === 'Admin';

      if (isAdmin) {
        // Admin users always go to admin dashboard
        console.log('Admin user detected on auth page, redirecting to admin dashboard');
        router.push(routes.admin.dashboard);
      } else {
        // Regular users go to home page
        router.push(routes.home);
      }
    }
  }, [isAuthenticated, userData, router]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href={routes.home} className="inline-block">
              <div className="flex items-center justify-center">
                <FaBook className="text-primary text-3xl mr-2" />
                <span className="text-2xl font-bold text-primary">BookStore</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8">
            {children}
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-sm text-neutral">
        <p>&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
