import React, { useState, useEffect } from 'react';
import { Notification } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MessageSquareMore, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useUser } from '../auth/UserProvider';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectReminders() {
  const { user } = useUser();
  const [reminderNotifications, setReminderNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadReminders();
    }
  }, [user?.id]);

  const loadReminders = async () => {
    try {
      const notifications = await Notification.filter({
        user_id: user.id,
        type: 'project_reminder',
        is_read: false
      }, '-created_date', 5);
      
      setReminderNotifications(notifications);
    } catch (error) {
      console.error('Failed to load reminder notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setReminderNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Projects Needing Follow-up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-[rgb(var(--surface-dark))] rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Projects Needing Follow-up
          {reminderNotifications.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-300 ml-auto">
              {reminderNotifications.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminderNotifications.length > 0 ? (
          <div className="space-y-3">
            {reminderNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 bg-amber-900/20 rounded-lg border border-amber-500/30 hover:bg-amber-900/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-amber-200 font-medium mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-amber-300/80 text-sm mb-2">
                      {notification.body}
                    </p>
                    <p className="text-amber-400/60 text-xs">
                      {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {notification.link && (
                      <Link to={notification.link}>
                        <Button 
                          size="sm" 
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-green-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">All Projects Up to Date</p>
            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
              No projects need follow-up right now
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}