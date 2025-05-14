import React, { useState } from 'react';
import Link from 'next/link';
import { FaLock, FaEnvelope, FaSpinner, FaQuestionCircle } from 'react-icons/fa';
import { useLogin } from '@/lib/react-query/hooks/useAuth';
import { routes } from '@/lib/routes';

/**
 * LoginForm component for user authentication
 */
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 md:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-neutral-dark mb-3">
          Welcome Back
        </h2>
        <p className="text-neutral">
          Sign in to continue to your BookStore account
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-neutral-light rounded-lg text-neutral-dark placeholder-neutral focus:outline-none focus:ring-2 focus:ring-primary border-none shadow-inner"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>


          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-neutral-light rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-dark">
              Remember me
            </label>
          </div>
        </div>

        {loginMutation.isError && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {(loginMutation.error as any)?.message || 'Failed to login. Please check your credentials.'}
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
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-8 text-center">
        <p className="text-neutral">
          Don't have an account?{' '}
          <Link href={routes.auth.register} className="text-primary hover:text-primary-dark font-medium transition-colors">
            Create one now
          </Link>
        </p>
        <div className="mt-4">
          <Link
            href={routes.auth.forgotPassword}
            className="inline-flex items-center justify-center px-4 py-2 border border-primary/30 rounded-lg text-primary hover:text-primary-dark hover:border-primary font-medium transition-all"
          >
            <FaQuestionCircle className="mr-2" />
            Forgot your password?
          </Link>
        </div>
        <div className="mt-3">
          <Link href={routes.home} className="text-neutral-dark hover:text-primary text-sm transition-colors">
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
