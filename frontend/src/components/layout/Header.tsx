'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBook, FaSearch, FaShoppingCart, FaBookmark, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/atoms/Button';
import { routes } from '@/lib/routes';
import { useCurrentUser, useIsAdmin, useLogout } from '@/lib/react-query/hooks/useAuth';
import { useUI, useCart } from '@/hooks/useStore';

/**
 * Header component for the main layout
 */
export const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: userData } = useCurrentUser();
  const isAuthenticated = !!userData?.user;
  const isAdmin = useIsAdmin();
  const logoutMutation = useLogout();
  
  const { ui, toggleMobileMenu, toggleCart, toggleSearch } = useUI();
  const { cart } = useCart();

  // Navigation items
  const navItems = [
    {
      label: 'Home',
      href: routes.home,
    },
    {
      label: 'Books',
      href: routes.books.list,
    },
  ];

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <header className="bg-white shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={routes.home} className="flex items-center">
            <FaBook className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold text-primary">BookStore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-neutral-dark hover:text-primary transition-colors ${
                  pathname === item.href ? 'text-primary font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleSearch}
              className="text-neutral-dark hover:text-primary transition-colors"
              aria-label="Search"
            >
              <FaSearch />
            </button>

            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  href={routes.member.bookmarks}
                  className="text-neutral-dark hover:text-primary transition-colors"
                  aria-label="Bookmarks"
                >
                  <FaBookmark />
                </Link>

                <button
                  onClick={toggleCart}
                  className="text-neutral-dark hover:text-primary transition-colors relative"
                  aria-label="Cart"
                >
                  <FaShoppingCart />
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </button>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center text-neutral-dark hover:text-primary transition-colors">
                  <FaUser className="mr-2" />
                  <span className="text-sm">{userData?.user?.fullName?.split(' ')[0]}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {isAdmin ? (
                    <Link
                      href={routes.admin.dashboard}
                      className="block px-4 py-2 text-sm text-neutral-dark hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      href={routes.member.profile}
                      className="block px-4 py-2 text-sm text-neutral-dark hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      My Profile
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-dark hover:bg-primary-light hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={routes.auth.login}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href={routes.auth.register}>
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-neutral-dark hover:text-primary transition-colors"
            aria-label={ui.isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {ui.isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {ui.isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-light">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-neutral-dark hover:text-primary transition-colors ${
                    pathname === item.href ? 'text-primary font-medium' : ''
                  }`}
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-neutral-light pt-4 mt-4">
                <button
                  onClick={() => {
                    toggleSearch();
                    toggleMobileMenu();
                  }}
                  className="flex items-center text-neutral-dark hover:text-primary transition-colors mb-4"
                >
                  <FaSearch className="mr-2" />
                  <span>Search</span>
                </button>

                {isAuthenticated && !isAdmin && (
                  <>
                    <Link
                      href={routes.member.bookmarks}
                      className="flex items-center text-neutral-dark hover:text-primary transition-colors mb-4"
                      onClick={toggleMobileMenu}
                    >
                      <FaBookmark className="mr-2" />
                      <span>Bookmarks</span>
                    </Link>

                    <button
                      onClick={() => {
                        toggleCart();
                        toggleMobileMenu();
                      }}
                      className="flex items-center text-neutral-dark hover:text-primary transition-colors mb-4"
                    >
                      <FaShoppingCart className="mr-2" />
                      <span>Cart ({cart.totalItems})</span>
                    </button>
                  </>
                )}

                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <Link
                        href={routes.admin.dashboard}
                        className="flex items-center text-neutral-dark hover:text-primary transition-colors mb-4"
                        onClick={toggleMobileMenu}
                      >
                        <FaUser className="mr-2" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        href={routes.member.profile}
                        className="flex items-center text-neutral-dark hover:text-primary transition-colors mb-4"
                        onClick={toggleMobileMenu}
                      >
                        <FaUser className="mr-2" />
                        <span>My Profile</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="flex items-center text-neutral-dark hover:text-primary transition-colors"
                    >
                      <FaUser className="mr-2" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link href={routes.auth.login} onClick={toggleMobileMenu}>
                      <Button variant="ghost" className="w-full justify-center">
                        Login
                      </Button>
                    </Link>
                    <Link href={routes.auth.register} onClick={toggleMobileMenu}>
                      <Button className="w-full justify-center">Register</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
