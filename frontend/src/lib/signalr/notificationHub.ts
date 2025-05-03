import * as signalR from '@microsoft/signalr';
import { API_URL } from '@/lib/api/client';

/**
 * Notification type
 */
export interface Notification {
  message: string;
  timestamp: string;
  type: 'order' | 'announcement';
}

/**
 * Notification callback function type
 */
export type NotificationCallback = (notification: Notification) => void;

/**
 * SignalR notification hub connection
 */
class NotificationHubConnection {
  private connection: signalR.HubConnection | null = null;
  private orderCallbacks: NotificationCallback[] = [];
  private announcementCallbacks: NotificationCallback[] = [];
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000; // 2 seconds

  /**
   * Initialize the SignalR connection
   */
  public async initialize(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL.replace('/api', '')}/hubs/notification`, {
          withCredentials: true,
          // Don't skip negotiation - let SignalR choose the best transport
          skipNegotiation: false,
          // Allow all transport types instead of forcing WebSockets
          transport: signalR.HttpTransportType.None
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff strategy
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.connection.on('ReceiveOrderNotification', (notification: Notification) => {
        this.orderCallbacks.forEach(callback => callback(notification));
      });

      this.connection.on('ReceiveAnnouncement', (notification: Notification) => {
        this.announcementCallbacks.forEach(callback => callback(notification));
      });

      // Set up connection state change handler
      this.connection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
        this.isConnected = false;
      });

      this.connection.onreconnected(() => {
        console.log('SignalR reconnected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.connection.onclose(() => {
        console.log('SignalR connection closed');
        this.isConnected = false;
        this.attemptReconnect();
      });

      // Start the connection
      await this.connection.start();
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      this.isConnected = false;
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to the SignalR hub
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.initialize();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * Subscribe to order notifications
   * @param callback - Function to call when an order notification is received
   * @returns Unsubscribe function
   */
  public subscribeToOrderNotifications(callback: NotificationCallback): () => void {
    this.orderCallbacks.push(callback);

    return () => {
      this.orderCallbacks = this.orderCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to announcement notifications
   * @param callback - Function to call when an announcement notification is received
   * @returns Unsubscribe function
   */
  public subscribeToAnnouncementNotifications(callback: NotificationCallback): () => void {
    this.announcementCallbacks.push(callback);

    return () => {
      this.announcementCallbacks = this.announcementCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Stop the SignalR connection
   */
  public async stop(): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log('SignalR disconnected');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }
}

// Create a singleton instance
export const notificationHub = new NotificationHubConnection();
