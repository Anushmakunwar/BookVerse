'use client';

import React from 'react';
import UserReviews from '@/components/reviews/UserReviews';
import { useAuth } from '@/lib/hooks/useAuth';
import { redirect } from 'next/navigation';

/**
 * Page for displaying user's reviews
 */
export default function UserReviewsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    redirect('/login?redirect=/account/reviews');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Reviews</h1>
      <UserReviews />
    </div>
  );
}
