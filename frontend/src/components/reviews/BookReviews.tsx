'use client';

import React, { useState, useEffect } from 'react';
import { useBookReviews, useCreateReview, useBookPurchaseCheck } from '@/lib/react-query/hooks/useReviews';
import { formatDate } from '@/lib/utils';
import { Loader2, AlertCircle, Star, StarHalf, ShoppingCart, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CreateReviewInput } from '@/lib/api/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface BookReviewsProps {
  bookId: number;
}

/**
 * Component to display reviews for a book and allow users to submit new reviews
 */
const BookReviews: React.FC<BookReviewsProps> = ({ bookId }) => {
  const { data, isLoading, isError, refetch: refetchReviews } = useBookReviews(bookId);
  const { isAuthenticated, user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const purchaseCheck = useBookPurchaseCheck(bookId);

  // Force refresh authentication status on component mount
  useEffect(() => {
    // Check if we have a stored user but the isAuthenticated flag is false
    const storedUser = localStorage.getItem('bookstore_user');
    if (storedUser && !isAuthenticated) {
      console.log('Stored user found but isAuthenticated is false, refreshing auth state');
      // We could trigger a refresh of the auth state here if needed
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load reviews</h3>
        <p className="text-gray-600 mb-4">
          {data?.message || 'There was an error loading reviews. Please try again later.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { reviews } = data;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : star - 0.5 <= averageRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {isAuthenticated && !showReviewForm && (
          <>
            {purchaseCheck.isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Checking purchase status...</span>
              </div>
            ) : purchaseCheck.isError ? (
              <div className="flex flex-col items-end">
                <div className="text-sm text-red-600 mb-2">
                  Error checking purchase status
                </div>
              </div>
            ) : purchaseCheck.data?.hasPurchased ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-blue-100 text-gray-800 font-bold rounded-md hover:bg-blue-200 transition-colors shadow-md border border-blue-300"
                >
                  <span className="text-gray-800 font-bold">Write a Review</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-600 mb-2">
                  {user ? 'Purchase this book to write a review' : 'Sign in and purchase this book to write a review'}
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="#"
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 transition-colors flex items-center border border-gray-300"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.error("You need to purchase this book before you can review it");
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4 text-gray-800" />
                    <span className="text-gray-800 font-bold">Purchase to Review</span>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm bookId={bookId} onCancel={() => setShowReviewForm(false)} />
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-2 text-gray-800">No Reviews Yet</h3>
          <p className="text-gray-700 font-medium">Be the first to review this book!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{review.memberName}</h3>
                    <span className="text-gray-500 text-sm">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ReviewFormProps {
  bookId: number;
  onCancel: () => void;
}

/**
 * Form for submitting a new review
 */
const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const createReviewMutation = useCreateReview();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData: CreateReviewInput = {
      bookId,
      rating,
      comment
    };

    createReviewMutation.mutate(reviewData, {
      onSuccess: (data) => {
        if (data.success) {
          // Invalidate the purchase check query to refresh the status
          queryClient.invalidateQueries({
            queryKey: ['reviews', 'purchase', bookId]
          });

          // Show success message
          toast.success('Your review has been submitted successfully!');

          // Close the form
          onCancel();
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-gray-700 mb-2">
          Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          required
          minLength={10}
          maxLength={1000}
          placeholder="Share your thoughts about this book..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-800 font-bold rounded-md hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-800 font-bold">Cancel</span>
        </button>
        <button
          type="submit"
          disabled={createReviewMutation.isPending || !comment.trim()}
          className="px-4 py-2 bg-blue-100 text-gray-800 font-bold rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-blue-300"
        >
          {createReviewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-800" />}
          <span className="text-gray-800 font-bold">Submit Review</span>
        </button>
      </div>
    </form>
  );
};

export default BookReviews;
