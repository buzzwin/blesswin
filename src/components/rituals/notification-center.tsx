import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Users, Trophy, Flame, Sparkles } from 'lucide-react';
import { cn } from '@lib/utils';

function formatDistanceToNow(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

interface Notification {
  id: string;
  type: 'friend_joined' | 'achievement_unlocked' | 'streak_reminder' | 'level_up';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: () => void;
  className?: string;
}

const notificationIcons = {
  friend_joined: Users,
  achievement_unlocked: Trophy,
  streak_reminder: Flame,
  level_up: Sparkles
};

const notificationColors = {
  friend_joined: 'text-blue-600 dark:text-blue-400',
  achievement_unlocked: 'text-yellow-600 dark:text-yellow-400',
  streak_reminder: 'text-orange-600 dark:text-orange-400',
  level_up: 'text-purple-600 dark:text-purple-400'
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  className
}: NotificationCenterProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
        aria-label='Notifications'
      >
        <Bell className='h-5 w-5' />
        {unreadCount > 0 && (
          <span className='absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className='absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Notifications
              </h3>
              <div className='flex items-center gap-2'>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllAsRead();
                    }}
                    className='text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className='rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className='max-h-96 overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='p-8 text-center'>
                  <Bell className='mx-auto mb-2 h-12 w-12 text-gray-400' />
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type];
                    const colorClass = notificationColors[notification.type];

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900',
                          !notification.read && 'bg-purple-50/50 dark:bg-purple-900/10'
                        )}
                        onClick={() => {
                          if (!notification.read) {
                            onMarkAsRead(notification.id);
                          }
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                          setIsOpen(false);
                        }}
                      >
                        <div className='flex items-start gap-3'>
                          <div className={cn('mt-0.5 shrink-0', colorClass)}>
                            <Icon className='h-5 w-5' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-start justify-between'>
                              <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className='ml-2 h-2 w-2 shrink-0 rounded-full bg-purple-600' />
                              )}
                            </div>
                            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                              {notification.message}
                            </p>
                            <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
                              {formatDistanceToNow(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className='border-t border-gray-200 p-3 dark:border-gray-700'>
                <button
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className='w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

