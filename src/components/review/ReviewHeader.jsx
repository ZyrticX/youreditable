import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export default function ReviewHeader({ project }) {
  if (!project) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-[rgb(var(--surface-dark))]/95 backdrop-blur-sm border-b border-[rgb(var(--border-dark))]">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" 
              alt="Editable Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-none">
                {project.name}
              </h1>
              <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-secondary))] mt-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{project.client_display_name}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(project.created_at), "MMM d")}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
            Review
          </Badge>
        </div>
      </div>
    </div>
  );
}