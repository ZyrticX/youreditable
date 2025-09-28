
import React, { useState, useEffect, useRef } from "react";
import { Notification } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  CheckCheck,
  Loader2,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../auth/UserProvider";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'new_feedback':
      return <MessageSquare className="w-4 h-4 text-blue-400" />;
    case 'project_approved':
    case 'video_approved':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'link_expired':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case 'new_version':
      return <Clock className="w-4 h-4 text-purple-400" />;
    default:
      return <Bell className="w-4 h-4 text-gray-400" />;
  }
};

export default function NotificationCenter() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastNotificationCount = useRef(0);
  const hasInitialLoad = useRef(false);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      // Poll more frequently (every 10 seconds) for real-time updates
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const showNewNotificationToast = (notification) => {
    const notificationIcon = getNotificationIcon(notification.type);
    
    toast(notification.title, {
      description: notification.body,
      icon: notificationIcon,
      duration: 6000,
      action: notification.link ? {
        label: "View",
        onClick: () => {
          navigate(notification.link);
          markAsRead(notification.id);
        }
      } : undefined,
      className: "bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] text-white",
      descriptionClassName: "text-gray-300"
    });
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    if (!Notification || typeof Notification.filter !== 'function') {
        console.error("Notification entity not available for filtering yet.");
        setError("Notification service not ready.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const userNotifications = await Notification.filter(
        { user_id: user.id }, 
        '-created_date', 
        20
      );
      
      // Check for new notifications and show toast
      if (hasInitialLoad.current && userNotifications.length > lastNotificationCount.current) {
        const newNotifications = userNotifications.slice(0, userNotifications.length - lastNotificationCount.current);
        
        // Show toast for each new notification that is unread
        newNotifications.forEach(notification => {
          if (!notification.is_read) {
            showNewNotificationToast(notification);
          }
        });
      }
      
      setNotifications(userNotifications);
      lastNotificationCount.current = userNotifications.length;
      hasInitialLoad.current = true;
      
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError("Couldn't load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => Notification.update(n.id, { is_read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to the link if available
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[rgb(var(--accent-primary))] text-white text-xs animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="dark w-80 p-0 bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]" align="end">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
            <CardTitle className="text-white text-base">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs flex items-center gap-1.5 text-gray-300 hover:text-white">
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                  <p>Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 text-red-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                  <p className="mb-4">{error}</p>
                  <Button variant="outline" onClick={loadNotifications}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 hover:bg-[rgb(var(--surface-dark))] cursor-pointer border-l-2 transition-colors ${
                        !notification.is_read 
                          ? 'border-l-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/5' 
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-white' : 'text-gray-300'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                          </p>
                        </div>
                        {notification.link && (
                          <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No new notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
