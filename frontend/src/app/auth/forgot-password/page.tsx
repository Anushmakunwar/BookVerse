'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { ForgotPasswordForm } from '@/components/auth';
import { routes } from '@/lib/routes';

/**
 * Forgot Password page component
 */
const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-light/50 flex flex-col">
      {/* Back to home link */}
      <div className="container mx-auto px-4 py-6">
        <Link 
          href={routes.home} 
          className="inline-flex items-center text-neutral-dark hover:text-primary transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to home
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-neutral">
        <p>© {new Date().getFullYear()} BookStore. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
