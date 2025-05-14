'use client';

import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingOverlay component displays a loading spinner with an optional message
 * Can be used as a full-screen overlay or within a container
 * 
 * @example
 * ```tsx
 * <LoadingOverlay isVisible={isLoading} message="Logging in..." fullScreen />
 * ```
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (!isVisible) return null;

  const overlayClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90'
    : 'absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-90';

  return (
    <div className={overlayClasses}>
      <div className="text-center">
        <FaSpinner className="animate-spin text-primary text-4xl mx-auto mb-4" />
        <p className="text-neutral-dark font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
