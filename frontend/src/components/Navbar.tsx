import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaShoppingCart, FaBookmark, FaUser, FaSignOutAlt, FaSignInAlt, FaBook, FaSearch, FaBoxOpen, FaStar, FaBullhorn, FaUserCog, FaHome, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from './ui/Button';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Handle clicks outside the profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    // Focus the search input when it becomes visible
    if (!showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };



  return (
    <nav className="bg-[#264653] text-white shadow-soft sticky top-0 z-50 border-0 mt-0 pt-0">
      {/* Navbar content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative h-10 w-10 mr-2">
                <div className="absolute inset-0 bg-secondary rounded-lg transform rotate-6"></div>
                <div className="absolute inset-0 bg-primary rounded-lg flex items-center justify-center">
                  <FaBook className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold font-serif">BookVerse</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                href={user?.role === 'Admin' ? '/admin' : '/'}
                className="px-3 py-2 text-sm font-medium hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>
              {user?.role !== 'Admin' && (
                <Link href="/books" className="px-3 py-2 text-sm font-medium hover:text-accent transition-colors duration-200">
                  Books
                </Link>
              )}
              {isAuthenticated && user?.role === 'Member' && (
                <>
                  <Link href="/member/orders" className="px-3 py-2 text-sm font-medium hover:text-accent transition-colors duration-200">
                    My Orders
                  </Link>
                  <Link href="/member/reviews" className="px-3 py-2 text-sm font-medium hover:text-accent transition-colors duration-200">
                    My Reviews
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">


            {isAuthenticated ? (
              <>
                {user?.role === 'Member' && (
                  <>
                    <Link href="/cart" className="relative p-2 rounded-full hover:bg-primary/20 transition-colors duration-200">
                      <FaShoppingCart className="h-5 w-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                    <Link href="/bookmarks" className="p-2 rounded-full hover:bg-primary/20 transition-colors duration-200">
                      <FaBookmark className="h-5 w-5" />
                    </Link>
                  </>
                )}
                {user?.role === 'Admin' && (
                  <Link
                    href="/admin/books"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors duration-200"
                  >
                    <FaBook className="h-4 w-4" />
                    <span className="text-sm font-medium">Manage Books</span>
                  </Link>
                )}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-primary/20 transition-colors duration-200 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <FaUser className="h-4 w-4" />
                    </div>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft py-2 z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-black truncate">{user?.email}</p>
                      </div>
                      {user?.role === 'Member' && (
                        <>
                          <Link
                            href="/member/orders"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaBoxOpen className="mr-2 text-primary" /> My Orders
                          </Link>
                          <Link
                            href="/member/reviews"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaStar className="mr-2 text-primary" /> My Reviews
                          </Link>
                        </>
                      )}
                      {user?.role === 'Admin' && (
                        <>
                          <Link
                            href="/admin/announcements"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaBullhorn className="mr-2 text-primary" /> Manage Announcements
                          </Link>
                          <Link
                            href="/admin/users"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaUserCog className="mr-2 text-primary" /> Manage Users
                          </Link>
                        </>
                      )}

                      {user?.role === 'Staff' && (
                        <>
                          <Link
                            href="/staff"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaHome className="mr-2 text-primary" /> Staff Dashboard
                          </Link>
                          <Link
                            href="/staff/orders"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaBoxOpen className="mr-2 text-primary" /> Process Orders
                          </Link>
                          <Link
                            href="/staff/order-history"
                            className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <FaClipboardList className="mr-2 text-primary" /> Order History
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-neutral-light flex items-center transition-colors duration-200"
                      >
                        <FaSignOutAlt className="mr-2 text-secondary" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary-light"
                  >
                    Register
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary-dark flex items-center space-x-2">
                    <FaSignInAlt className="h-4 w-4" />
                    <span>Sign in</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full hover:bg-primary/20 transition-colors duration-200"
            >
              <FaSearch className="h-5 w-5" />
            </button>

            {isAuthenticated && user?.role === 'Member' && (
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-primary/20 transition-colors duration-200">
                <FaShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-full hover:bg-primary/20 transition-colors duration-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>



      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#264653] border-t border-gray-700">
          <div className="px-4 py-3 space-y-3">
            {isAuthenticated && (
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-700 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <FaUser className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>
              </div>
            )}

            <Link
              href={user?.role === 'Admin' ? '/admin' : user?.role === 'Staff' ? '/staff' : '/'}
              className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {user?.role === 'Member' && (
              <Link
                href="/books"
                className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Books
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {user?.role === 'Member' && (
                  <>
                    <Link
                      href="/bookmarks"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaBookmark className="mr-3 text-accent" />
                        Bookmarks
                      </div>
                    </Link>
                    <Link
                      href="/cart"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaShoppingCart className="mr-3 text-accent" />
                        Cart {totalItems > 0 && <span className="ml-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>}
                      </div>
                    </Link>
                    <Link
                      href="/member/orders"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaClipboardList className="mr-3 text-accent" />
                        My Orders
                      </div>
                    </Link>
                    <Link
                      href="/member/reviews"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaStar className="mr-3 text-accent" />
                        My Reviews
                      </div>
                    </Link>

                  </>
                )}
                {user?.role === 'Admin' && (
                  <>
                    <Link
                      href="/admin/books"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaBook className="mr-3 text-accent" />
                        Manage Books
                      </div>
                    </Link>
                    <Link
                      href="/admin/announcements"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaBullhorn className="mr-3 text-accent" />
                        Manage Announcements
                      </div>
                    </Link>
                    <Link
                      href="/admin/users"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaUserCog className="mr-3 text-accent" />
                        Manage Users
                      </div>
                    </Link>
                  </>
                )}
                {user?.role === 'Staff' && (
                  <>
                    <Link
                      href="/staff"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaHome className="mr-3 text-accent" />
                        Staff Dashboard
                      </div>
                    </Link>
                    <Link
                      href="/staff/orders"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaBoxOpen className="mr-3 text-accent" />
                        Process Orders
                      </div>
                    </Link>
                    <Link
                      href="/staff/order-history"
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaClipboardList className="mr-3 text-accent" />
                        Order History
                      </div>
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/20 transition-colors duration-200 text-secondary"
                  >
                    <div className="flex items-center">
                      <FaSignOutAlt className="mr-3" />
                      Sign out
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-700 mt-2 pt-2 flex flex-col space-y-2 px-3">
                <Link
                  href="/register"
                  className="block py-2 rounded-lg text-center text-base font-medium border border-primary text-primary hover:bg-primary-light transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="block py-2 rounded-lg text-center text-base font-medium bg-primary hover:bg-primary-dark text-white transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-center">
                    <FaSignInAlt className="mr-2" />
                    Sign in
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
