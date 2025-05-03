'use client';

import React, { useState } from 'react';
import { useUserReviews, useUpdateReview, useDeleteReview } from '@/lib/react-query/hooks/useReviews';
import { formatDate } from '@/lib/utils';
import { Loader2, AlertCircle, Star, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { UpdateReviewInput } from '@/lib/api/types';

/**
 * Component to display and manage user's reviews
 */
const UserReviews: React.FC = () => {
  const { data, isLoading, isError } = useUserReviews();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load reviews</h3>
        <p className="text-gray-600 mb-4">
          {data?.message || 'There was an error loading your reviews. Please try again later.'}
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

  if (data.reviews.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
        <Link
          href="/books"
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-black font-medium rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 inline-flex items-center justify-center"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Reviews</h2>

      <div className="space-y-6">
        {data.reviews.map((review) => (
          <div key={review.id} className="border rounded-lg overflow-hidden">
            {editingReviewId === review.id ? (
              <EditReviewForm
                reviewId={review.id}
                bookId={review.bookId}
                initialRating={review.rating}
                initialComment={review.comment}
                onCancel={() => setEditingReviewId(null)}
              />
            ) : (
              <>
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                  <div>
                    <Link href={`/books/${review.bookId}`} className="font-semibold hover:text-primary">
                      {review.bookTitle}
                    </Link>
                    <p className="text-sm text-gray-500">Reviewed on {formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingReviewId(review.id)}
                      className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                      title="Edit review"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <DeleteReviewButton reviewId={review.id} bookId={review.bookId} />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface EditReviewFormProps {
  reviewId: number;
  bookId: number;
  initialRating: number;
  initialComment: string;
  onCancel: () => void;
}

/**
 * Form for editing an existing review
 */
const EditReviewForm: React.FC<EditReviewFormProps> = ({
  reviewId,
  bookId,
  initialRating,
  initialComment,
  onCancel
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [hoveredRating, setHoveredRating] = useState(0);
  const updateReviewMutation = useUpdateReview(reviewId, bookId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData: UpdateReviewInput = {
      rating,
      comment
    };

    updateReviewMutation.mutate(reviewData, {
      onSuccess: (data) => {
        if (data.success) {
          onCancel();
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50">
      <h3 className="font-semibold text-lg mb-4">Edit Your Review</h3>

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
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateReviewMutation.isPending || !comment.trim()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {updateReviewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Review
        </button>
      </div>
    </form>
  );
};

interface DeleteReviewButtonProps {
  reviewId: number;
  bookId: number;
}

/**
 * Button for deleting a review with confirmation
 */
const DeleteReviewButton: React.FC<DeleteReviewButtonProps> = ({ reviewId, bookId }) => {
  const deleteReviewMutation = useDeleteReview(bookId);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteReviewMutation.isPending}
      className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete review"
    >
      {deleteReviewMutation.isPending && deleteReviewMutation.variables === reviewId ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
};

export default UserReviews;
