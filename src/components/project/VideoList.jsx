import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VideoExpansionPanel from "./VideoExpansionPanel";

export default function VideoList({
  videos,
  project,
  onUpdate,
  onAddVideo, // New prop for add video functionality
  isArchived
}) {
  const [expandedVideo, setExpandedVideo] = useState(null);

  const getVideoStatusConfig = (status) => {
    const configs = {
      approved: {
        badgeClass: "bg-green-500/20 text-green-300 border-green-500/30",
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: "Approved"
      },
      needs_changes: {
        badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "Needs Changes"
      },
      pending_review: {
        badgeClass: "border-gray-600 text-gray-400",
        icon: <Clock className="w-3 h-3" />,
        label: "Pending Review"
      }
    };
    return configs[status] || configs.pending_review;
  };

  return (
    <div className="w-full">
      <Card className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] rounded-lg sm:rounded-xl shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-white flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Videos ({videos.length})
            </div>
            {isArchived && (
              <Badge className="bg-gray-700 text-gray-300">Read Only</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-[rgb(var(--text-secondary))] text-sm sm:text-base mt-2">
            {isArchived
              ? "Videos in this archived project cannot be modified"
              : "Manage your project videos and track approval status"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-0">
          {videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map((video) => {
                const config = getVideoStatusConfig(video.status);
                const isExpanded = expandedVideo === video.id;

                return (
                  <div
                    key={video.id}
                    className="border border-[rgb(var(--border-dark))] rounded-xl bg-[rgb(var(--surface-dark))] overflow-hidden"
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgb(var(--surface-light))] border border-[rgb(var(--border-dark))] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--accent-primary))]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm sm:text-base truncate">
                              {video.title}
                            </h3>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                              <Badge className={`${config.badgeClass} flex items-center gap-1 text-xs border`}>
                                {config.icon}
                                <span className="hidden sm:inline">{config.label}</span>
                                <span className="sm:hidden">{config.label.split(' ')[0]}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedVideo(isExpanded ? null : video.id)}
                            className="text-[rgb(var(--text-secondary))] hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[rgb(var(--border-dark))] p-3 sm:p-4">
                            <VideoExpansionPanel
                              video={video}
                              project={project}
                              onUpdate={onUpdate}
                              isArchived={isArchived}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-[rgb(var(--text-secondary))]">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-medium text-sm sm:text-base mb-2">No videos in this project</h3>
              <p className="text-xs sm:text-sm">Videos will appear here once they're imported from Google Drive.</p>
            </div>
          )}

          {/* Add Video Button - Always visible unless archived */}
          {!isArchived && (
            <div className="mt-6 pt-4 border-t border-[rgb(var(--border-dark))]">
              <Button
                onClick={onAddVideo}
                variant="outline"
                className="w-full bg-[rgb(var(--surface-dark))] hover:bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] text-white border-dashed hover:border-[rgb(var(--accent-primary))] transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Video from Google Drive
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}