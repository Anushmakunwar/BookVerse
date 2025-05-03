'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Notification } from '@/lib/signalr/notificationHub';

interface NotificationContextType {
  isConnected: boolean;
  orderNotifications: Notification[];
  announcementNotifications: Notification[];
  clearOrderNotifications: () => void;
  clearAnnouncementNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider for real-time notifications
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const {
    isConnected,
    orderNotifications,
    announcementNotifications,
    clearOrderNotifications,
    clearAnnouncementNotifications,
  } = useNotifications();

  return (
    <NotificationContext.Provider
      value={{
        isConnected,
        orderNotifications,
        announcementNotifications,
        clearOrderNotifications,
        clearAnnouncementNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use the notification context
 */
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
