'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

// This component must be used with 'use client' directive
// It's designed to be imported dynamically with { ssr: false }

/**
 * A debug component that displays authentication state
 * Only visible in development mode
 */
const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [cookies, setCookies] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [storedUser, setStoredUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
      setStoredUser(localStorage.getItem('bookstore_user'));
    }
  }, []);

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs"
      >
        {showDetails ? 'Hide Auth Debug' : 'Show Auth Debug'}
      </button>

      {showDetails && (
        <div className="bg-white border border-gray-300 rounded-md shadow-lg p-4 mt-2 w-80 text-xs">
          <h3 className="font-bold mb-2">Auth Debug</h3>

          <div className="mb-2">
            <span className="font-semibold">Status:</span>{' '}
            {loading ? (
              <span className="text-yellow-600">Loading...</span>
            ) : isAuthenticated ? (
              <span className="text-green-600">Authenticated</span>
            ) : (
              <span className="text-red-600">Not Authenticated</span>
            )}
          </div>

          {user && (
            <div className="mb-2">
              <span className="font-semibold">User:</span>{' '}
              <span>{user.email}</span> ({user.role})
            </div>
          )}

          <div className="mb-2">
            <span className="font-semibold">Cookies:</span>{' '}
            <span className="break-all">{cookies || 'None'}</span>
          </div>

          <div className="mb-2">
            <span className="font-semibold">Stored User:</span>{' '}
            <span className="break-all">{storedUser ? 'Present' : 'None'}</span>
          </div>

          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  setCookies(document.cookie);
                  setStoredUser(localStorage.getItem('bookstore_user'));
                }
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('bookstore_user');
                setStoredUser(null);
              }}
              className="bg-red-500 text-white px-2 py-1 rounded-md text-xs"
            >
              Clear Storage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
