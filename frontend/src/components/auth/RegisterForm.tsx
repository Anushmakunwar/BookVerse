import React, { useState } from 'react';
import Link from 'next/link';
import { FaLock, FaEnvelope, FaUser, FaSpinner } from 'react-icons/fa';
import { useRegister } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';

/**
 * RegisterForm component for user registration
 */
const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const registerMutation = useRegister();
  const isLoading = registerMutation.isPending;
  
  const validateForm = (): boolean => {
    setValidationError('');
    
    if (!fullName.trim()) {
      setValidationError('Full name is required');
      return false;
    }
    
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    registerMutation.mutate({ fullName, email, password });
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 md:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-neutral-dark mb-3">
          Create Account
        </h2>
        <p className="text-neutral">
          Join BookStore and discover your next favorite book
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-neutral-dark mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-neutral" />
              </div>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                placeholder="Your full name"
                disabled={isLoading}
              />
            </div>
          </div>
          
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
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-dark mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-neutral" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-neutral">Password must be at least 6 characters long</p>
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
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
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

        {(validationError || registerMutation.isError) && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {validationError || (registerMutation.error as any)?.message || 'Registration failed. Please try again.'}
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
      
      {/* Footer Links */}
      <div className="mt-8 text-center">
        <p className="text-neutral">
          Already have an account?{' '}
          <Link href={routes.auth.login} className="text-primary hover:text-primary-dark font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
