'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBook, FaBoxOpen, FaSignOutAlt, FaHome, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '@/lib/hooks/useAuth';
import { routes } from '@/lib/routes';

interface StaffLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for staff pages
 */
const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: routes.staff.dashboard, label: 'Dashboard', icon: <FaHome className="h-5 w-5" /> },
    { href: routes.staff.orders, label: 'Process Orders', icon: <FaBoxOpen className="h-5 w-5" /> },
    { href: routes.staff.orderHistory, label: 'Order History', icon: <FaClipboardList className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-neutral-light">
      {/* Sidebar */}
      <aside className="w-64 bg-[#264653] text-white shadow-soft">
        <div className="p-6">
          <Link href={routes.staff.dashboard} className="flex items-center">
            <div className="relative h-10 w-10 mr-2">
              <div className="absolute inset-0 bg-secondary rounded-lg transform rotate-6"></div>
              <div className="absolute inset-0 bg-primary rounded-lg flex items-center justify-center">
                <FaBook className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">Staff Portal</span>
          </Link>
        </div>

        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-white hover:bg-primary/20 transition-colors ${
                    pathname === item.href ? 'bg-primary/20 font-medium' : ''
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
                <span className="text-white font-bold">{user?.fullName?.charAt(0) || 'S'}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Staff User'}</p>
                <p className="text-xs text-gray-300 truncate">{user?.email}</p>
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
              {navItems.find((item) => pathname === item.href)?.label || 'Staff Portal'}
            </h1>
            <div className="flex items-center">
              <span className="text-sm text-neutral-dark mr-2">
                {user?.fullName}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-neutral-light p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
