import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { routes } from '@/lib/routes';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-hot-toast';

/**
 * ForgotPasswordForm component for requesting password reset OTP
 */
const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Log the request payload for debugging
      console.log('Sending forgot password request with payload:', { Email: email });

      // Make direct API call with capital 'E' in Email
      const response = await apiClient.post('/Auth/forgot-password', { Email: email });

      console.log('Forgot password response:', response.data);

      // In development mode, show a special message about checking email logs
      toast.success(
        'OTP sent successfully! In development mode, check the BookStore/email_logs directory for the OTP email.',
        { duration: 6000 }
      );

      // Add a small delay before redirecting
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirect to reset password page with email in query params
      router.push(`${routes.auth.resetPassword}?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 md:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-neutral-dark mb-3">
          Forgot Password
        </h2>
        <p className="text-neutral">
          Enter your email address and we'll send you an OTP to reset your password
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email-address" className="block text-sm font-medium text-neutral-dark mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-neutral" />
            </div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
              placeholder="your.email@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-accent hover:bg-accent/90 text-[#264653] font-bold py-3 px-4 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-8 text-center">
        <Link
          href={routes.auth.login}
          className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
