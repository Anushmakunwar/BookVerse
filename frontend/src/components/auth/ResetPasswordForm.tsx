import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaLock, FaSpinner, FaArrowLeft, FaKey } from 'react-icons/fa';
import { useResetPasswordWithOTP } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';

/**
 * ResetPasswordForm component for resetting password with OTP
 */
const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const resetPasswordMutation = useResetPasswordWithOTP();
  const isLoading = resetPasswordMutation.isPending;
  
  // Update email if query param changes
  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);
  
  const validatePassword = () => {
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !otp || !newPassword || !confirmPassword) {
      return;
    }
    
    if (!validatePassword()) {
      return;
    }
    
    resetPasswordMutation.mutate({
      email,
      otp,
      newPassword,
      confirmPassword,
    });
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 md:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-neutral-dark mb-3">
          Reset Password
        </h2>
        <p className="text-neutral">
          Enter the OTP sent to your email and create a new password
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-neutral-dark mb-1">
              Email Address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
              placeholder="your.email@example.com"
              disabled={isLoading || !!emailFromQuery}
            />
          </div>
          
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-neutral-dark mb-1">
              One-Time Password (OTP)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaKey className="h-5 w-5 text-neutral" />
              </div>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-neutral-dark mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-neutral" />
              </div>
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-dark mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-neutral" />
              </div>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {passwordError && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {passwordError}
          </div>
        )}

        {resetPasswordMutation.isError && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {(resetPasswordMutation.error as any)?.message || 'Failed to reset password. Please try again.'}
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
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
      
      {/* Footer Links */}
      <div className="mt-8 text-center">
        <div className="mb-2">
          <Link 
            href={routes.auth.forgotPassword} 
            className="text-primary hover:text-primary-dark font-medium transition-colors"
          >
            Didn't receive OTP? Request again
          </Link>
        </div>
        <Link 
          href={routes.auth.login} 
          className="inline-flex items-center text-neutral-dark hover:text-primary transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
