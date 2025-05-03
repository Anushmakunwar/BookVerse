'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaBookmark, FaRegBookmark, FaShoppingCart, FaBook } from 'react-icons/fa';
import { Button } from '@/components/ui/atoms/Button';
import { formatPrice } from '@/lib/utils';
import { Book } from '@/lib/api/types';
import { bookService } from '@/lib/api';
import { useCurrentUser, useIsAdmin } from '@/lib/react-query/hooks/useAuth';
import { useAddBookmark, useRemoveBookmark, useIsBookmarked } from '@/lib/react-query/hooks/useBookmarks';
import { useAddToCart } from '@/lib/react-query/hooks/useCart';

/**
 * BookCard props interface
 */
interface BookCardProps {
  book: Book;
  showActions?: boolean;
}

/**
 * BookCard component displays a book with its cover, title, author, and price
 * Optionally shows actions like add to cart and bookmark
 * 
 * @example
 * ```tsx
 * <BookCard book={book} />
 * <BookCard book={book} showActions={false} />
 * ```
 */
export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  showActions = true 
}) => {
  const { data: userData } = useCurrentUser();
  const isAuthenticated = !!userData?.user;
  const isAdmin = useIsAdmin();
  
  const { data: bookmarkData } = useIsBookmarked(book.id);
  const isBookmarked = bookmarkData?.isBookmarked || false;
  const bookmarkId = bookmarkData?.bookmarkId;
  
  const addBookmarkMutation = useAddBookmark();
  const removeBookmarkMutation = useRemoveBookmark();
  const addToCartMutation = useAddToCart();

  // Process the cover image URL
  const coverImage = bookService.ensureValidImageUrl(book.coverImage);

  /**
   * Handle bookmark toggle
   */
  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) return;

    if (isBookmarked && bookmarkId) {
      removeBookmarkMutation.mutate({ bookmarkId, bookId: book.id });
    } else {
      addBookmarkMutation.mutate(book.id);
    }
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    if (!isAuthenticated) return;
    
    addToCartMutation.mutate({ bookId: book.id, quantity: 1 });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden card-hover">
      <div className="relative">
        {/* Bookmark button positioned absolutely on top of the image */}
        {showActions && isAuthenticated && !isAdmin && (
          <button
            onClick={handleBookmarkToggle}
            className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-soft transition-colors duration-200 hover:bg-white"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? (
              <FaBookmark className="text-accent text-lg" />
            ) : (
              <FaRegBookmark className="text-neutral text-lg" />
            )}
          </button>
        )}

        {/* Book cover image */}
        <div className="relative h-56 bg-neutral-light">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={book.title}
              fill
              className="object-cover"
              unoptimized={coverImage.includes('/uploads/')}
              onError={(e) => {
                // Set a default image if the book cover fails to load
                e.currentTarget.src = `https://picsum.photos/seed/${book.id}/200/300`;
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-primary-light">
              <FaBook className="text-primary text-4xl mb-2" />
              <span className="text-primary-dark font-medium">No image</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <Link href={`/books/${book.id}`} className="block group">
          <h3 className="text-lg font-semibold text-neutral-dark truncate group-hover:text-primary transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-sm text-neutral mb-2 italic">{book.author}</p>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xl font-bold text-primary">
              {formatPrice(book.price)}
            </p>

            {showActions && !isAdmin && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
                disabled={!isAuthenticated}
                size="sm"
                className={`rounded-full ${!isAuthenticated ? 'bg-neutral-light text-neutral' : 'bg-secondary hover:bg-secondary-dark text-black'}`}
                aria-label="Add to cart"
              >
                <FaShoppingCart className={`${!isAuthenticated ? 'mr-0' : 'mr-2'}`} />
                {isAuthenticated && <span>Add</span>}
              </Button>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
