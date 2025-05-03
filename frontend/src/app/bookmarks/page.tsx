'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaShoppingCart, FaBookmark, FaArrowLeft } from 'react-icons/fa';
import { useBookmarks } from '@/context/BookmarkContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

export default function BookmarksPage() {
  const { bookmarks, loading, removeBookmark, refreshBookmarks } = useBookmarks();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const { addToCart } = useCart();

  // Use a ref to track if we've set up the interval
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Explicitly fetch bookmarks when the component mounts
  useEffect(() => {
    // Only set up the interval once
    if (!intervalRef.current) {
      console.log('BookmarksPage: Setting up refresh interval');

      // Set up an interval to refresh bookmarks every 60 seconds
      // and without showing loading state to avoid flickering
      intervalRef.current = setInterval(() => {
        if (isAuthenticated) {
          console.log('BookmarksPage: Refreshing bookmarks from interval...');
          // Use true to skip loading state for background refreshes
          refreshBookmarks(true);
        }
      }, 60000); // 60 seconds
    }

    // Clean up the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        console.log('BookmarksPage: Clearing refresh interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]); // Only depend on authentication state

  const handleAddToCart = async (bookId: number) => {
    await addToCart(bookId, 1);
  };

  if (!isAuthenticated || isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8">
          {!isAuthenticated ? (
            <>
              <h1 className="text-2xl font-serif font-bold text-black mb-4">Please Sign In</h1>
              <p className="text-neutral mb-6">You need to be signed in to view your bookmarks.</p>
              <Link href="/login">
                <div className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center">
                  Sign In
                </div>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-serif font-bold text-black mb-4">Admin Access Restricted</h1>
              <p className="text-neutral mb-6">Admin users cannot access bookmarks. Please use a member account.</p>
              <Link href="/books">
                <div className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center">
                  Browse Books
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black mb-8">Your Bookmarks</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-soft p-6 flex">
              <div className="w-24 h-24 bg-neutral-light rounded-xl"></div>
              <div className="ml-4 flex-grow space-y-2">
                <div className="h-6 bg-neutral-light rounded-xl w-3/4"></div>
                <div className="h-4 bg-neutral-light rounded-xl w-1/2"></div>
                <div className="h-4 bg-neutral-light rounded-xl w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8">
          <div className="text-primary mb-4">
            <FaBookmark className="mx-auto h-16 w-16" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-4">No Bookmarks Yet</h1>
          <p className="text-neutral mb-6">You haven't bookmarked any books yet.</p>
          <Link href="/books">
            <div className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center">
              Browse Books
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-black mb-8">Your Bookmarks</h1>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="p-6">
          <div className="divide-y divide-gray-200">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="py-6 flex flex-col sm:flex-row items-start gap-6">
                {/* Book Cover Image */}
                <div className="w-32 h-44 flex-shrink-0 bg-neutral-light/50 rounded-xl overflow-hidden shadow-soft">
                  <Link href={`/books/${bookmark.bookId}`}>
                    <Image
                      src={bookmark.bookCoverImage ?
                        bookmark.bookCoverImage :
                        `https://picsum.photos/seed/${bookmark.bookId}/128/180`}
                      alt={bookmark.bookTitle}
                      width={128}
                      height={180}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Set a default image if the book cover fails to load
                        e.currentTarget.src = `https://picsum.photos/seed/${bookmark.bookId}/128/180`;
                      }}
                      unoptimized={bookmark.bookCoverImage?.includes('/uploads/') ? true : false}
                    />
                  </Link>
                </div>

                {/* Book Details */}
                <div className="flex-grow">
                  <Link href={`/books/${bookmark.bookId}`} className="text-xl font-medium text-black hover:text-primary transition-colors duration-200 block mb-2">
                    {bookmark.bookTitle || 'Untitled Book'}
                  </Link>
                  <p className="text-md text-neutral mb-2">By {bookmark.bookAuthor || 'Unknown Author'}</p>
                  <p className="text-lg text-primary font-medium mb-4">${(bookmark.bookPrice || 0).toFixed(2)}</p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAddToCart(bookmark.bookId)}
                      className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center"
                    >
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </button>

                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="border border-destructive text-destructive hover:bg-destructive/10 py-2 px-6 rounded-xl transition-colors duration-200 inline-flex items-center justify-center"
                    >
                      <FaTrash className="mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/books">
          <div className="bg-white text-black border border-primary text-primary hover:bg-primary/10 py-2 px-6 rounded-xl transition-colors duration-200 inline-flex items-center justify-center shadow-soft">
            <FaArrowLeft className="mr-2" />
            Back to Books
          </div>
        </Link>
      </div>
    </div>
  );
}
