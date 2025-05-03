'use client';

import React from 'react';
import BookCard from './BookCard';
import { Book } from '@/lib/api/types';
import { FaSpinner } from 'react-icons/fa';

/**
 * BookGrid props interface
 */
interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
}

/**
 * BookGrid component displays a grid of books
 * 
 * @example
 * ```tsx
 * <BookGrid books={books} />
 * <BookGrid books={books} isLoading={isLoading} />
 * <BookGrid books={books} showActions={false} />
 * <BookGrid books={[]} emptyMessage="No books found" />
 * ```
 */
export const BookGrid: React.FC<BookGridProps> = ({
  books,
  isLoading = false,
  showActions = true,
  emptyMessage = 'No books available',
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-neutral-dark text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} showActions={showActions} />
      ))}
    </div>
  );
};

export default BookGrid;
