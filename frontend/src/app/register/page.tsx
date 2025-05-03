'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { FaLock, FaEnvelope, FaUser } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(fullName, email, password);
      if (!success) {
        setError('Registration failed. Please try again.');
      }
      // If successful, the register function in AuthContext will handle redirection
    } catch (err: any) {
      setError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
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
                    placeholder="Create a strong password"
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
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="w-full">
              <input 
                type="submit" 
                value={isLoading ? 'Creating account...' : 'Create account'}
                disabled={isLoading}
                className="w-full cursor-pointer bg-accent hover:bg-accent/90 text-[#264653] font-bold py-3 px-4 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
              />
            </div>
          </form>
          
          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-neutral">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
