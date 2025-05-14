'use client';

import React from 'react';
import { useUI } from '@/hooks/useStore';
import LoadingOverlay from './LoadingOverlay';

/**
 * GlobalLoadingOverlay component that uses the global UI state
 * to show/hide a full-screen loading overlay
 */
const GlobalLoadingOverlay: React.FC = () => {
  const { ui } = useUI();
  
  return (
    <LoadingOverlay 
      isVisible={ui.isGlobalLoading} 
      message={ui.loadingMessage} 
      fullScreen={true} 
    />
  );
};

export default GlobalLoadingOverlay;
