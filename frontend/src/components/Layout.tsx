import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import AnnouncementBanner from './announcements/AnnouncementBanner';
import ShippingNotification from './ShippingNotification';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';
  const pathname = usePathname();

  // We no longer need to handle staff pages here as it's handled in Providers.tsx
  // This prevents double-wrapping and hydration errors

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Only show notifications on non-admin pages */}
      {!isAdmin && (
        <>
          <ShippingNotification />
          {/* Spacer to account for fixed shipping notification */}
          <div className="h-8"></div>
          <AnnouncementBanner />
        </>
      )}
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#264653] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-serif">BookVerse</h3>
              <p className="text-gray-300 mb-4">Your journey through the world of books begins here.</p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                  <FaFacebook size={20} />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                  <FaTwitter size={20} />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-accent transition-colors">
                  <FaInstagram size={20} />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="text-gray-300 hover:text-accent transition-colors">
                    Books
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-gray-300 hover:text-accent transition-colors">
                    Cart
                  </Link>
                </li>
                <li>
                  <Link href="/bookmarks" className="text-gray-300 hover:text-accent transition-colors">
                    Bookmarks
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-accent" />
                  <span>Bouddha Kathmandu, Nepal</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="mr-3 text-accent" />
                  <span>+977-9844188522</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-3 text-accent" />
                  <span>pudasainiaryan03@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} BookVerse. All rights reserved.
          </div>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2a9d8f',
            color: '#fff',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#2a9d8f',
            },
          },
          error: {
            style: {
              background: '#e63946',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#e63946',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;
