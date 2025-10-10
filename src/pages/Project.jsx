import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/api/entities";
import { Video } from "@/api/entities";
import { VideoVersion } from "@/api/entities";
import { Note } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Plus,
  MessageSquare,
  Calendar,
  ShieldAlert,
  Archive
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isAfter, addDays } from "date-fns";
import { toast } from "sonner";
import { SendEmail } from "@/api/integrations";
import { User as UserEntity } from "@/api/entities";
import { useUser } from '../components/auth/UserProvider';
import { AnimatePresence, motion } from "framer-motion";
import { googleDrive } from "@/api/functions";
import { Approval } from "@/api/entities";

import VideoList from "../components/project/VideoList";
import ShareLinkCard from "../components/project/ShareLinkCard";
import ProjectHeader from "../components/project/ProjectHeader";
import { notifyNewVersion } from "../components/notifications/NotificationHelper";
import AddVideoModal from "../components/project/AddVideoModal";

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls with exponential backoff
const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Rate limit hit, retrying in ${delayMs}ms (attempt ${attempt}/${maxRetries})`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
};

const extractFileId = (url) => {
    const patterns = [
        /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/,
        /drive\.google\.com\/file\/u\/\d+\/d\/([a-zA-Z0-9_-]{25,})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
};

export default function ProjectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get("id");

  const [project, setProject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [notesByVersion, setNotesByVersion] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null); // Now represents the expanded video
  const { user } = useUser();
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState(null);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);

  // Use ref to prevent multiple simultaneous loads
  const loadingRef = useRef(false);

  useEffect(() => {
    if (projectId && user && !loadingRef.current) {
      loadProject();
    } else if (!projectId) {
        setAccessDenied(true);
        setIsLoading(false);
    }
  }, [projectId, user?.id]); // תוקן - רק user.id במקום כל האובייקט user

  const loadProject = async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setAccessDenied(false);
    setSelectedVideo(null); // Reset selected video on project load
    setError(null);

    try {
      console.log("Loading project:", projectId, "for user:", user.id);

      // Load project with retry logic
      const projects = await retryApiCall(async () => {
        return await Project.filter({ id: projectId, user_id: user.id });
      });

      if (projects.length === 0) {
        setAccessDenied(true);
        return;
      }

      const currentProject = projects[0];
      setProject(currentProject);

      // Add small delay before next API call
      await delay(200);

      // Load videos with retry logic
      const videoList = await retryApiCall(async () => {
        return await Video.filter({ project_id: currentProject.id }, "order_index");
      });

      setVideos(videoList);

      // Add delay before loading notes
      await delay(300);

      // Load all notes in batches to avoid rate limits
      const batchSize = 5;
      let allVersions = [];

      // Load video versions in batches
      for (let i = 0; i < videoList.length; i += batchSize) {
        const videoBatch = videoList.slice(i, i + batchSize);

        const batchPromises = videoBatch.map(async (video) => {
          await delay(50); // Small delay between calls
          return retryApiCall(async () => {
            return await VideoVersion.filter({video_id: video.id});
          });
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(versions => {
          allVersions.push(...versions);
        });

        // Delay between batches
        if (i + batchSize < videoList.length) {
          await delay(500);
        }
      }

      // Create version ID set for filtering notes
      const videoVersionIds = new Set(allVersions.map(v => v.id));

      // Load notes with retry logic
      await delay(300);
      const allNotes = await retryApiCall(async () => {
        return await Note.filter({}, "-created_at");
      });

      // Filter notes for this project only
      const projectNotes = allNotes.filter(note => videoVersionIds.has(note.video_version_id));

      // Group notes by version
      const notesGroupedByVersion = {};
      projectNotes.forEach(note => {
        if (!notesGroupedByVersion[note.video_version_id]) {
            notesGroupedByVersion[note.video_version_id] = [];
        }
        notesGroupedByVersion[note.video_version_id].push(note);
      });

      setNotesByVersion(notesGroupedByVersion);

      // Auto-update project status based on current state
      await updateProjectStatusIfNeeded(currentProject, videoList, projectNotes);

    } catch (error) {
      console.error("Error loading project:", error);

      if (error.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
        toast.error("Rate limit exceeded. Please refresh the page in a moment.");
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        setAccessDenied(true);
      } else {
        setError("Failed to load project. Please try again.");
        toast.error("Failed to load project data");
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  // Function to automatically update project status based on current state
  const updateProjectStatusIfNeeded = async (currentProject, videoList, projectNotes) => {
    if (currentProject.status === 'archived') return; // Don't change archived projects

    let newStatus = currentProject.status;

    // Calculate what the status should be
    const allVideosApproved = videoList.length > 0 && videoList.every(video => video.status === 'approved');
    const hasAnyNotes = projectNotes.length > 0;
    const hasAnyPendingNotes = projectNotes.some(note => note.status === 'pending');

    if (allVideosApproved && !hasAnyPendingNotes) {
      // All videos approved and no pending notes = project should be approved
      newStatus = 'approved';
    } else if (hasAnyNotes && hasAnyPendingNotes) {
      // Has notes but some are still pending = needs changes
      newStatus = 'pending';
    } else if (hasAnyNotes && !hasAnyPendingNotes) {
      // Has notes but all are completed, but not all videos approved = still pending
      newStatus = 'pending';
    } else {
      // No notes yet, or project just created = active (waiting for feedback)
      newStatus = 'active';
    }

    // Update project status if it has changed
    if (newStatus !== currentProject.status) {
      try {
        await retryApiCall(async () => {
          return await Project.update(currentProject.id, {
            status: newStatus,
            last_status_change_at: new Date().toISOString()
          });
        });

        // Update local state
        setProject(prev => ({
          ...prev,
          status: newStatus,
          last_status_change_at: new Date().toISOString()
        }));

        console.log(`Project status auto-updated from ${currentProject.status} to ${newStatus}`);
      } catch (error) {
        console.error('Failed to auto-update project status:', error);
      }
    }
  };

  const handleApproveProject = async () => {
    if (!project || project.status === 'approved' || project.status === 'archived' || !user) {
      toast.info("Project is already approved or archived or user not found.");
      return;
    }

    setIsLoading(true);
    try {
        const videoUpdatePromises = videos.map(video =>
            retryApiCall(() => Video.update(video.id, { status: "approved" }))
        );

        const projectNotes = Object.values(notesByVersion).flat();
        const noteUpdatePromises = projectNotes.map(note =>
            retryApiCall(() => Note.update(note.id, { status: 'completed' }))
        );

        const projectUpdatePromise = retryApiCall(() => Project.update(project.id, {
            status: "approved",
            last_status_change_at: new Date().toISOString(),
        }));

        const approvalPromise = retryApiCall(() => Approval.create({
            scope_type: 'project', // לתאימות עם מדיניות RLS
            scope: 'project', // לתאימות עם NOT NULL constraint
            scope_id: project.id,
            approved_at: new Date().toISOString(),
            reviewer_label: `Editor Override (${user.full_name || user.email})`
        }));

        await Promise.all([
            ...videoUpdatePromises,
            ...noteUpdatePromises,
            projectUpdatePromise,
            approvalPromise
        ]);

        toast.success(`Project "${project.name}" and all its contents have been approved.`);
        await delay(1000); // Small delay to allow toast to be seen
        await loadProject();

    } catch (e) {
        if (e.response?.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment before trying again.");
        } else {
          toast.error("Failed to approve project.");
        }
        console.error("Project approval error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(prev => prev?.id === video.id ? null : video);
  };

  const handleUpdateVersion = async (videoToUpdate, newUrl) => {
      setIsLoading(true);
      try {
        const fileId = extractFileId(newUrl);
        if (!fileId) {
            toast.error("Invalid Google Drive file URL provided.");
            setIsLoading(false);
            return;
        }

        const response = await retryApiCall(() => googleDrive({ fileId }));
        const fileDetails = response.data;

        if (fileDetails.status !== 'success' || !fileDetails.file) {
            toast.error(fileDetails.message || "Could not retrieve video details from Google Drive.");
            setIsLoading(false);
            return;
        }

        const { file: driveVideoData } = fileDetails;

        const existingVersions = await retryApiCall(() => VideoVersion.filter({ video_id: videoToUpdate.id }));
        const currentVersionNumber = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version_number)) : 0;

        await delay(200);

        const newVersion = await retryApiCall(() => VideoVersion.create({
            video_id: videoToUpdate.id,
            version_number: currentVersionNumber + 1,
            source_type: 'drive',
            source_url: driveVideoData.previewUrl,
            file_id: driveVideoData.id,
            thumbnail_url: driveVideoData.thumbnailLink,
        }));

        await delay(200);

        await retryApiCall(() => Video.update(videoToUpdate.id, {
            current_version_id: newVersion.id,
            status: 'pending_review'
        }));

        // Create notification for new version
        if (user?.id && project) {
          await notifyNewVersion(
            user.id,
            videoToUpdate.title,
            currentVersionNumber + 1,
            project.name,
            project.id
          );
        }

        toast.success(`Video "${videoToUpdate.title}" updated to Version ${currentVersionNumber + 1}. Reviewers have been notified.`);
        await delay(1000);
        await loadProject();

      } catch (err) {
        if (err.response?.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment before trying again.");
        } else {
          toast.error("Failed to update video version.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
  };

  const handleNoteStatusChange = async (noteToUpdate, newStatus) => {
    try {
        await retryApiCall(async () => {
          return await Note.update(noteToUpdate.id, { status: newStatus });
        });

        // Optimistically update local state
        setNotesByVersion(prev => {
            const notesForVersion = prev[noteToUpdate.video_version_id];
            if (!notesForVersion) return prev;

            const updatedNotes = notesForVersion.map(n =>
                n.id === noteToUpdate.id ? { ...n, status: newStatus } : n
            );

            return {
                ...prev,
                [noteToUpdate.video_version_id]: updatedNotes
            };
        });
        toast.success(`Note status updated to ${newStatus}.`);
        // After note status changes, re-evaluate project status
        await loadProject();
    } catch (err) {
        if (err.response?.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment before trying again.");
        } else {
          toast.error("Failed to update note status.");
        }
        console.error(err);
    }
  };

  const handleApproveVideoByEditor = async (videoToApprove) => {
    if (!videoToApprove || videoToApprove.status === 'approved' || !user) return;
    setIsLoading(true);

    try {
        await retryApiCall(() => Video.update(videoToApprove.id, { status: "approved" }));

        await delay(200);

        await retryApiCall(() => Approval.create({
            scope: "video",
            scope_id: videoToApprove.id,
            version_id: videoToApprove.current_version_id,
            approved_at: new Date().toISOString(),
            reviewer_label: `Editor (${user.full_name || user.email})`,
        }));

        toast.success(`Video "${videoToApprove.title}" has been manually approved.`);

        await delay(1000);
        await loadProject(); // Re-load to trigger the status auto-update

    } catch(e) {
        if (e.response?.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment before trying again.");
        } else {
          toast.error("Failed to approve video.");
        }
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendForReview = async () => {
    if (!project || !user) {
        toast.error("An unexpected error occurred. Please refresh.");
        return;
    }

    try {
        const shareToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const shareExpiresAt = addDays(new Date(), 7).toISOString();

        await retryApiCall(async () => {
          return await Project.update(projectId, {
              status: "active", // Set to active when sending for review
              share_token: shareToken,
              share_expires_at: shareExpiresAt,
              last_status_change_at: new Date().toISOString(),
              approved_videos_count: 0
          });
        });

        // Update videos in batches to avoid rate limits
        await delay(300);
        for(const video of videos) {
            await delay(100);
            await retryApiCall(async () => {
              return await Video.update(video.id, { status: 'pending_review' });
            });
        }

        await loadProject();

        const shareUrl = `${window.location.origin}${createPageUrl(`Review?token=${shareToken}`)}`;
        navigator.clipboard.writeText(shareUrl);

        // Show success toast with helpful message
        toast.success("Review link copied! Share it with your client to get feedback.", {
          duration: 5000,
          description: "The link is valid for 7 days and doesn't require sign-up."
        });

    } catch(e) {
        if (e.response?.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment before trying again.");
        } else {
          toast.error("Failed to generate review link. Please try again.");
        }
        console.error(e);
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleExtendLink = async () => {
    if (!project || !user) {
      toast.error("An unexpected error occurred. Please refresh.");
      return;
    }
    setIsLoading(true);
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7); // Add 7 days

      await retryApiCall(async () => {
        return await Project.update(project.id, {
          share_expires_at: newExpiryDate.toISOString(),
        });
      });

      // Reload project data to reflect changes
      await loadProject();
      toast.success("Review link extended by 7 days.");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment before trying again.");
      } else {
        toast.error("Failed to extend link.");
      }
      console.error('Failed to extend link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewLink = async () => {
    if (!project || !user) {
      toast.error("An unexpected error occurred. Please refresh.");
      return;
    }
    setIsLoading(true);
    try {
      const newToken = generateUUID().replace(/-/g, '').substring(0, 32);
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7); // Add 7 days

      await retryApiCall(async () => {
        return await Project.update(project.id, {
          share_token: newToken,
          share_expires_at: newExpiryDate.toISOString(),
        });
      });

      // Reload project data to reflect changes
      await loadProject();
      toast.success("New review link generated.");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment before trying again.");
      } else {
        toast.error("Failed to generate new link.");
      }
      console.error('Failed to generate new link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!project || !project.share_token) {
      toast.error("No share link available.");
      return;
    }
    const shareUrl = `${window.location.origin}${createPageUrl(`Review?token=${project.share_token}`)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Review link copied to clipboard");
  };

  const getProjectStatus = () => {
    if (!project) return "loading";
    if (project.status === "archived" || project.status === "deleted") return "archived";
    if (project.status === 'approved') return "approved";
    if (project.status === 'active' && project.share_expires_at && isAfter(new Date(), new Date(project.share_expires_at))) {
      return 'expired';
    }
    return project.status;
  };

  const getStatusBadge = () => {
    const status = getProjectStatus();
    const configs = {
      active: { variant: "default", className: "bg-blue-500/20 text-blue-300", label: "In Review" },
      pending: { variant: "default", className: "bg-orange-500/20 text-orange-300", label: "Pending Changes" },
      approved: { variant: "default", className: "bg-green-500/20 text-green-300", label: "Approved" },
      expired: { variant: "destructive", className: "bg-yellow-500/20 text-yellow-300", label: "Link Expired" },
      archived: { variant: "default", className: "bg-gray-700 text-gray-300", label: "Archived"},
      loading: { variant: "outline", className: "", label: "Loading..." }
    };

    const config = configs[status] || configs.loading;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Check if project is archived - this will be used throughout the component
  const isProjectArchived = project?.status === 'archived';

  if (isLoading && !project) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-[rgb(var(--surface-dark))] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[rgb(var(--surface-light))] rounded-lg"></div>
              <div>
                <div className="h-5 sm:h-6 w-32 sm:w-48 bg-[rgb(var(--surface-light))] rounded"></div>
                <div className="h-3 sm:h-4 w-24 sm:w-32 bg-[rgb(var(--surface-light))] rounded mt-2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-24 sm:h-32 bg-[rgb(var(--surface-light))] rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="h-32 sm:h-48 bg-[rgb(var(--surface-light))] rounded-xl"></div>
                <div className="h-48 sm:h-64 bg-[rgb(var(--surface-light))] rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 text-center bg-[rgb(var(--surface-dark))] min-h-screen text-white flex items-center justify-center">
        <div className="max-w-sm sm:max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Error Loading Project</h1>
          <p className="text-sm sm:base text-[rgb(var(--text-secondary))] mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={createPageUrl("Projects")}>
              <Button variant="outline" className="w-full sm:w-auto">Back to Projects</Button>
            </Link>
            <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle access denied
  if (accessDenied || !project) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 text-center bg-[rgb(var(--surface-dark))] min-h-screen text-white flex items-center justify-center">
        <div className="max-w-sm sm:max-w-md mx-auto px-4">
          <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-sm sm:text-base text-[rgb(var(--text-secondary))] mb-6">
            You don't have permission to view this project, or it doesn't exist.
          </p>
          <Link to={createPageUrl("Projects")}>
            <Button variant="outline" className="w-full sm:w-auto">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[rgb(var(--surface-dark))] text-[rgb(var(--text-primary))] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {isProjectArchived && (
          <div className="p-4 bg-gray-900/50 border border-gray-600/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Archive className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-gray-300 font-medium">Archived Project</h3>
                <p className="text-gray-400 text-sm">This project has been archived and is now read-only. No changes can be made.</p>
              </div>
            </div>
          </div>
        )}

        <ProjectHeader
          project={project}
          onProjectUpdate={loadProject}
          onApproveProject={handleApproveProject}
          isArchived={isProjectArchived}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <VideoList
              videos={videos}
              project={project}
              onReloadVideos={loadProject}
              onAddVideo={() => setIsAddVideoModalOpen(true)}
              onUpdate={loadProject}
              isArchived={isProjectArchived}
            />
          </div>

          <div className="space-y-6">
            <ShareLinkCard
              project={project}
              onExtendLink={handleExtendLink}
              onGenerateNewLink={handleGenerateNewLink}
              isArchived={isProjectArchived}
            />
          </div>
        </div>
      </div>
      <AddVideoModal
        isOpen={isAddVideoModalOpen}
        onOpenChange={setIsAddVideoModalOpen}
        project={project}
        videos={videos}
        onUpdate={loadProject}
      />
    </div>
  );
}