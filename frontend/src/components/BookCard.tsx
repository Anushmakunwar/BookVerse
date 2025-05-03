import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaBookmark, FaRegBookmark, FaShoppingCart, FaBook } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useBookmarks } from '@/context/BookmarkContext';
import { useCart } from '@/context/CartContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from './ui/Button';
import { bookService } from '@/lib/api/services/book.service';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImage?: string | null;
}

const BookCard: React.FC<BookCardProps> = ({ id, title, author, price, coverImage }) => {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, addBookmark, removeBookmark, bookmarks, loading } = useBookmarks();
  const { addToCart } = useCart();
  const isAdmin = useIsAdmin();

  // Memoize these values to prevent unnecessary re-renders
  const bookmarked = React.useMemo(() => isBookmarked(id), [isBookmarked, id]);
  const bookmark = React.useMemo(() => bookmarks.find(b => b.bookId === id), [bookmarks, id]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated || loading) {
      return;
    }

    if (bookmarked && bookmark) {
      await removeBookmark(bookmark.id);
    } else {
      await addBookmark(id);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      return;
    }

    await addToCart(id, 1);
  };

  // Process the cover image URL
  const validCoverImage = bookService.ensureValidImageUrl(coverImage);

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden card-hover">
      <div className="relative">
        {/* Bookmark button positioned absolutely on top of the image */}
        {isAuthenticated && !isAdmin && (
          <button
            onClick={handleBookmarkToggle}
            className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-soft transition-colors duration-200 hover:bg-white"
          >
            {bookmarked ? (
              <FaBookmark className="text-accent text-lg" />
            ) : (
              <FaRegBookmark className="text-neutral text-lg" />
            )}
          </button>
        )}

        {/* Book cover image */}
        <div className="relative h-56 bg-neutral-light">
          {validCoverImage ? (
            <Image
              src={validCoverImage}
              alt={title}
              fill
              className="object-cover"
              unoptimized={validCoverImage.includes('/uploads/') ? true : false}
              onError={(e) => {
                // Set a default image if the book cover fails to load
                e.currentTarget.src = `https://picsum.photos/seed/${id}/200/300`;
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
        <Link href={`/books/${id}`} className="block group">
          <h3 className="text-lg font-semibold text-neutral-dark truncate group-hover:text-primary transition-colors duration-200">{title}</h3>
          <p className="text-sm text-neutral mb-2 italic">{author}</p>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xl font-bold text-primary">${price.toFixed(2)}</p>

            {!isAdmin && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
                disabled={!isAuthenticated}
                size="sm"
                className={`rounded-full ${!isAuthenticated ? 'bg-neutral-light text-neutral' : 'bg-secondary hover:bg-secondary-dark text-black'}`}
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
