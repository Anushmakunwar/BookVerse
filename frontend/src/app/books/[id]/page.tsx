'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FaBookmark, FaRegBookmark, FaShoppingCart, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { bookService } from '@/lib/api/services/book.service';
import { useAuth } from '@/context/AuthContext';
import { useBookmarks } from '@/context/BookmarkContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import BookReviews from '@/components/reviews/BookReviews';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string | null;
  genre: string;
  publishedDate: string;
  language: string;
  format: string;
  publisher: string;
  isAvailableInLibrary: boolean;
  inventoryCount: number;
  totalSold: number;
  averageRating: number;
  isbn: string;
  isOnSale: boolean;
  discountPrice?: number;
}

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { isBookmarked, addBookmark, removeBookmark, bookmarks } = useBookmarks();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBookById(Number(id));
        if (response.success) {
          setBook(response.book);
        } else {
          toast.error('Failed to load book details');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error('Error loading book details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  const bookmarked = book ? isBookmarked(book.id) : false;
  const bookmark = book ? bookmarks.find(b => b.bookId === book.id) : undefined;

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated || !book) {
      toast.error('Please login to bookmark books');
      return;
    }

    try {
      if (bookmarked && bookmark) {
        await removeBookmark(bookmark.id);
        toast.success('Bookmark removed');
      } else {
        await addBookmark(book.id);
        toast.success('Book bookmarked');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !book) {
      toast.error('Please login to add books to cart');
      return;
    }

    try {
      await addToCart(book.id, quantity);
      toast.success(`Added ${quantity} ${quantity === 1 ? 'copy' : 'copies'} to cart`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const incrementQuantity = () => {
    // Allow up to 99 books (reasonable limit for UI display)
    setQuantity(prev => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="md:w-1/3 bg-neutral-light h-96 rounded-2xl"></div>
          <div className="md:w-2/3 space-y-4">
            <div className="h-10 bg-neutral-light rounded-xl w-3/4"></div>
            <div className="h-6 bg-neutral-light rounded-xl w-1/2"></div>
            <div className="h-6 bg-neutral-light rounded-xl w-1/4"></div>
            <div className="h-32 bg-neutral-light rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-serif font-bold text-black">Book not found</h1>
        <Link href="/books" className="mt-4 inline-flex items-center text-primary hover:text-primary-dark transition-colors duration-200">
          <FaArrowLeft className="mr-2" /> Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/books" className="inline-flex items-center text-black hover:text-primary transition-colors duration-200 mb-8">
        <FaArrowLeft className="mr-2" /> Back to Books
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {book.coverImage ? (
              <div className="relative h-96">
                <Image
                  src={bookService.ensureValidImageUrl(book.coverImage) || ''}
                  alt={book.title}
                  fill
                  className="object-cover"
                  unoptimized={book.coverImage.includes('/uploads/') ? true : false}
                  onError={(e) => {
                    // Set a default image if the book cover fails to load
                    e.currentTarget.src = `https://picsum.photos/seed/${book.id}/400/600`;
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-neutral-light">
                <span className="text-neutral">No image available</span>
              </div>
            )}
          </div>
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">{book.title}</h1>
          <p className="text-xl text-neutral mb-6">by {book.author}</p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium">
              {book.genre}
            </span>
            <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-xl text-sm font-medium">
              {book.format}
            </span>
            <span className="bg-accent/10 text-[#264653] px-4 py-2 rounded-xl text-sm font-medium">
              {book.language}
            </span>
            {book.isAvailableInLibrary && (
              <span className="bg-primary-light/20 text-primary-dark px-4 py-2 rounded-xl text-sm font-medium">
                Available in Library
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-neutral">Publisher</p>
              <p className="font-medium text-black">{book.publisher}</p>
            </div>
            <div>
              <p className="text-neutral">Published Date</p>
              <p className="font-medium text-black">{book.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div>
              <p className="text-neutral">ISBN</p>
              <p className="font-medium text-black">{book.isbn}</p>
            </div>
            <div>
              <p className="text-neutral">Inventory</p>
              <p className="font-medium text-black">{book.inventoryCount > 0 ? `${book.inventoryCount} in stock` : 'Out of stock'}</p>
            </div>
          </div>

          <div className="mb-6">
            {book.isOnSale && book.discountPrice ? (
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-destructive">${book.discountPrice.toFixed(2)}</span>
                <span className="ml-2 text-lg text-neutral line-through">${book.price.toFixed(2)}</span>
                <span className="ml-2 bg-destructive/10 text-destructive px-3 py-1 rounded-xl text-xs font-bold">SALE</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">
                ${book.price.toFixed(2)}
              </div>
            )}
          </div>

          {book.averageRating > 0 && (
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(book.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-neutral">{book.averageRating.toFixed(1)} ({book.totalSold} sold)</span>
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-serif font-semibold text-black mb-3">Description</h3>
            <p className="text-neutral-dark">{book.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-neutral-light rounded-xl shadow-soft overflow-hidden">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="px-4 py-3 text-black hover:bg-neutral-light transition-colors duration-200 disabled:opacity-50 disabled:text-neutral"
              >
                <FaMinus />
              </button>
              <span className="px-4 py-2 text-center w-12 font-medium text-black">{quantity}</span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= 99}
                className="px-4 py-3 text-black hover:bg-neutral-light transition-colors duration-200 disabled:opacity-50 disabled:text-neutral"
              >
                <FaPlus />
              </button>
            </div>

            <Button
              onClick={isAuthenticated ? handleAddToCart : () => router.push('/login')}
              className="bg-primary hover:bg-primary-dark text-black flex-grow sm:flex-grow-0 py-3 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
            >
              <FaShoppingCart className="mr-2" />
              {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
            </Button>

            <Button
              variant="outline"
              onClick={isAuthenticated ? handleBookmarkToggle : () => router.push('/login')}
              className="border-primary text-primary hover:bg-primary/10 py-3 rounded-xl transition-colors duration-200"
            >
              {isAuthenticated ? (
                bookmarked ? (
                  <>
                    <FaBookmark className="mr-2 text-yellow-500" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <FaRegBookmark className="mr-2" />
                    Bookmark
                  </>
                )
              ) : (
                <>
                  <FaRegBookmark className="mr-2" />
                  Login to Bookmark
                </>
              )}
            </Button>
          </div>

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-neutral">
              Please <Link href="/login" className="text-primary hover:text-primary-dark transition-colors duration-200">sign in</Link> to add books to your cart or bookmarks.
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-white rounded-2xl shadow-soft p-6">
        <BookReviews bookId={book.id} />
      </div>
    </div>
  );
}
