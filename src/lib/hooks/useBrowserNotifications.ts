import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    if (permission === 'denied') {
      toast.error('Notifications are blocked. Please enable them in your browser settings.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported, permission]);

  const showNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<void> => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    try {
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification(title, {
          icon: '/logo192.png',
          badge: '/logo128.png',
          ...options
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/logo192.png',
          ...options
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [isSupported, permission]);

  const scheduleDailyReminder = useCallback(async (
    time: string, // HH:MM format
    message: string
  ): Promise<void> => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    // This is a simplified version - in production, you'd want to use
    // a service worker with background sync or a backend service
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      showNotification('Daily Ritual Reminder', {
        body: message,
        tag: 'daily-ritual-reminder',
        requireInteraction: false
      });
    }, delay);
  }, [isSupported, permission, showNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleDailyReminder
  };
}

