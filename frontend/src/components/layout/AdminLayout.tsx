'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaBook, FaUsers, FaShoppingCart, FaTachometerAlt, FaSignOutAlt, FaBullhorn, FaChartLine } from 'react-icons/fa';
import { useCurrentUser, useIsAdmin, useLogout } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';

/**
 * AdminLayout props interface
 */
interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout component provides the layout for admin pages
 * Includes sidebar navigation
 *
 * @example
 * ```tsx
 * <AdminLayout>
 *   <Component {...pageProps} />
 * </AdminLayout>
 * ```
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data: userData } = useCurrentUser();
  const isAdmin = useIsAdmin();
  const logoutMutation = useLogout();

  // Redirect if not admin
  useEffect(() => {
    if (userData && !isAdmin) {
      router.push(routes.home);
    }
  }, [userData, isAdmin, router]);

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push(routes.auth.login);
  };

  // Navigation items
  const navItems = [
    {
      label: 'Dashboard',
      icon: <FaTachometerAlt className="h-5 w-5" />,
      href: routes.admin.dashboard,
    },
    {
      label: 'Books',
      icon: <FaBook className="h-5 w-5" />,
      href: routes.admin.books.list,
    },
    {
      label: 'Users',
      icon: <FaUsers className="h-5 w-5" />,
      href: routes.admin.users.list,
    },
    {
      label: 'Orders',
      icon: <FaShoppingCart className="h-5 w-5" />,
      href: routes.admin.orders.list,
    },
    {
      label: 'Announcements',
      icon: <FaBullhorn className="h-5 w-5" />,
      href: routes.admin.announcements,
    },
    {
      label: 'Reports',
      icon: <FaChartLine className="h-5 w-5" />,
      href: routes.admin.reports,
    },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-neutral">Please wait while we check your credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-light">
      {/* Sidebar */}
      <aside className="w-64 bg-[#264653] text-white shadow-soft">
        <div className="p-6">
          <Link href={routes.admin.dashboard} className="flex items-center">
            <div className="relative h-10 w-10 mr-2">
              <div className="absolute inset-0 bg-secondary rounded-lg transform rotate-6"></div>
              <div className="absolute inset-0 bg-primary rounded-lg flex items-center justify-center">
                <FaBook className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">Admin Portal</span>
          </Link>
        </div>

        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-white hover:bg-primary/20 transition-colors ${
                    pathname === item.href ||
                    (pathname?.startsWith(item.href) && item.href !== routes.admin.dashboard)
                      ? 'bg-primary/20 font-medium'
                      : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold">{userData?.user?.fullName?.charAt(0) || 'A'}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">{userData?.user?.fullName || 'Admin User'}</p>
                <p className="text-xs text-gray-300 truncate">{userData?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-primary/20 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-soft p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-neutral-dark">
              {navItems.find((item) =>
                pathname === item.href ||
                (pathname?.startsWith(item.href) && item.href !== routes.admin.dashboard)
              )?.label || 'Admin Portal'}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-neutral-light p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
