'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaHome } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-6 rounded-full">
            <FaLock className="text-red-600 text-5xl" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>

        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
          >
            <FaHome className="mr-2" /> Go to Homepage
          </Button>

          <Button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
