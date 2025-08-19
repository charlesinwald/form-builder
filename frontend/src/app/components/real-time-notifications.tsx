'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X, Bell, CheckCircle, User, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'response' | 'milestone' | 'alert' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  icon?: React.ReactNode;
  actions?: {
    label: string;
    action: () => void;
  }[];
  data?: any;
}

interface RealTimeNotificationsProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoHideDuration?: number;
}

export function RealTimeNotifications({
  notifications,
  onDismiss,
  onDismissAll,
  position = 'top-right',
  maxNotifications = 5,
  autoHideDuration = 10000
}: RealTimeNotificationsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Auto-dismiss notifications after specified duration
  useEffect(() => {
    if (autoHideDuration <= 0) return;

    const timers = notifications.map(notification => {
      if (dismissedIds.has(notification.id)) return null;
      
      return setTimeout(() => {
        handleDismiss(notification.id);
      }, autoHideDuration);
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [notifications, autoHideDuration]);

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
    onDismiss?.(id);
  };

  const handleDismissAll = () => {
    setDismissedIds(new Set(notifications.map(n => n.id)));
    onDismissAll?.();
  };

  const visibleNotifications = notifications
    .filter(n => !dismissedIds.has(n.id))
    .slice(0, maxNotifications);

  const getIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'response':
        return <User className="h-4 w-4" />;
      case 'milestone':
        return <TrendingUp className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'response':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'milestone':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
      case 'alert':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}>
      <div className="space-y-2 pointer-events-auto">
        {/* Dismiss All Button */}
        {visibleNotifications.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mb-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              className="text-xs"
            >
              Dismiss all
            </Button>
          </motion.div>
        )}

        {/* Notifications */}
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: position.includes('right') ? 50 : -50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.1
                }
              }}
              exit={{ 
                opacity: 0, 
                x: position.includes('right') ? 50 : -50,
                scale: 0.9,
                transition: { duration: 0.2 }
              }}
              className="w-80"
            >
              <Card className={`border-2 shadow-lg ${getTypeColor(notification.type)}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">{getIcon(notification)}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {notification.actions && (
                          <div className="flex gap-2 mt-3">
                            {notification.actions.map((action, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={action.action}
                                className="text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* More notifications indicator */}
        {notifications.length > maxNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Badge variant="secondary" className="text-xs">
              +{notifications.length - maxNotifications} more
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    updateNotification
  };
}