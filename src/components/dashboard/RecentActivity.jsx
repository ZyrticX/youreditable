import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { format } from "date-fns";

export default function RecentActivity({ activities = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'note' ? 'bg-blue-100' :
                  activity.type === 'approval' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {activity.type === 'note' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'approval' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {activity.type === 'created' && <Clock className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.project}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}