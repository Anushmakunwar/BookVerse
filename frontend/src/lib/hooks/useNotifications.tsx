import { useEffect, useState } from 'react';
import { notificationHub, Notification } from '@/lib/signalr/notificationHub';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'react-hot-toast';

/**
 * Hook for handling real-time notifications
 */
export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [orderNotifications, setOrderNotifications] = useState<Notification[]>([]);
  const [announcementNotifications, setAnnouncementNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Initialize the connection
    const initializeConnection = async () => {
      try {
        console.log('Initializing notification hub connection...');
        await notificationHub.initialize();
        setIsConnected(true);
        console.log('Notification hub connection established successfully');
      } catch (error) {
        console.error('Failed to initialize notification hub:', error);
        // Don't show error toast for notification connection failures
        // as they're not critical to the application's functionality
      }
    };

    // Add a small delay before connecting to ensure authentication is fully established
    const connectionTimer = setTimeout(() => {
      initializeConnection();
    }, 1000);

    // Subscribe to order notifications
    const unsubscribeOrder = notificationHub.subscribeToOrderNotifications((notification) => {
      // Add to state
      setOrderNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10 notifications

      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New Order
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // Subscribe to announcement notifications
    const unsubscribeAnnouncement = notificationHub.subscribeToAnnouncementNotifications((notification) => {
      // Add to state
      setAnnouncementNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10 notifications

      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Announcement
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    });

    // Clean up on unmount
    return () => {
      clearTimeout(connectionTimer);
      unsubscribeOrder();
      unsubscribeAnnouncement();

      // Stop the SignalR connection when the component unmounts
      notificationHub.stop().catch(error => {
        console.error('Error stopping notification hub:', error);
      });
    };
  }, [isAuthenticated]);

  return {
    isConnected,
    orderNotifications,
    announcementNotifications,
    clearOrderNotifications: () => setOrderNotifications([]),
    clearAnnouncementNotifications: () => setAnnouncementNotifications([]),
  };
};
