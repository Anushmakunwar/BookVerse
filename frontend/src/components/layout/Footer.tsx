'use client';

import React from 'react';
import Link from 'next/link';
import { FaBook, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { routes } from '@/lib/routes';

/**
 * Footer component for the main layout
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-light">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href={routes.home} className="flex items-center">
              <FaBook className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-primary">BookStore</span>
            </Link>
            <p className="mt-4 text-sm text-neutral">
              Your one-stop destination for all your reading needs. Discover, explore, and enjoy a
              vast collection of books across various genres.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-neutral-dark mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={routes.home}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={routes.books.list}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link
                  href={routes.books.search}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-neutral-dark mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={routes.auth.login}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href={routes.auth.register}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href={routes.member.cart}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href={routes.member.bookmarks}
                  className="text-sm text-neutral hover:text-primary transition-colors"
                >
                  Bookmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Social media */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-neutral-dark mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-neutral hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="text-xl" />
              </a>
              <a
                href="#"
                className="text-neutral hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a
                href="#"
                className="text-neutral hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-light mt-8 pt-6 text-center">
          <p className="text-sm text-neutral">
            &copy; {currentYear} BookStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
