import React, { ReactNode } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { FaLock, FaSpinner } from 'react-icons/fa';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
  staffOnly?: boolean;
}

export default function ProtectedRoute({ children, requiredRole, adminOnly, staffOnly }: ProtectedRouteProps) {
  // Determine what to pass to useAuthorization based on props
  let authParam: string | boolean | undefined;
  const [showLoading, setShowLoading] = React.useState(true);

  if (adminOnly === true) {
    authParam = true; // true means Admin only
  } else if (staffOnly === true) {
    authParam = 'Staff'; // 'Staff' means Staff or Admin
  } else {
    authParam = requiredRole;
  }

  const { isAuthorized, isLoading } = useAuthorization(authParam);

  // Add a delay before showing content to ensure authentication is properly established
  React.useEffect(() => {
    if (!isLoading && isAuthorized) {
      // Add a delay before showing the content to ensure all data is loaded
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthorized]);

  if (isLoading || showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl mb-4" />
        <p className="text-gray-600">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // The useAuthorization hook will redirect, so we just return null here
  }

  return <>{children}</>;
}
