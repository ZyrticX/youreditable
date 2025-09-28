
import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/api/entities";
import { Video } from "@/api/entities";
import { VideoVersion } from "@/api/entities";
import { Note } from "@/api/entities";
import { Approval } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquare, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { isAfter } from "date-fns";
import { toast } from "sonner";
import { SendEmail } from "@/api/integrations";
import { User as UserEntity } from "@/api/entities";

import VideoCarousel from "../components/review/VideoCarousel";
import ReviewHeader from "../components/review/ReviewHeader";
import QuickNotePopup from "../components/review/QuickNotePopup";
import ActionsPopup from "../components/review/ActionsPopup";
import DesktopReviewInterface from "../components/review/DesktopReviewInterface";
import { notifyNewFeedback, notifyVideoApproval, notifyProjectApproval } from "../components/notifications/NotificationHelper";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
};

export default function Review() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get("token");
  
  const [project, setProject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitBatchId] = useState(() => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  });
  const [projectOwner, setProjectOwner] = useState(null);
  const pausedTimeRef = useRef(0);

  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Check if desktop
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (token) {
      loadReviewData();
    } else {
      setError("No review token provided");
      setIsLoading(false);
    }
  }, [token]);

  const loadReviewData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const projects = await retryApiCall(() => Project.filter({ share_token: token }));
      if (projects.length === 0) {
        setError("Review link not found");
        return;
      }
      
      const foundProject = projects[0];
      
      if (isAfter(new Date(), new Date(foundProject.share_expires_at))) {
        setError("This review link has expired");
        return;
      }
      
      setProject(foundProject);
      
      try {
        const owners = await retryApiCall(() => UserEntity.filter({ id: foundProject.user_id }));
        if (owners.length > 0) setProjectOwner(owners[0]);
      } catch (e) { 
        console.log("Could not load project owner info (anonymous access)"); 
      }

      const videoList = await retryApiCall(() => Video.filter({ project_id: foundProject.id }, "order_index"));
      
      const videosWithVersions = await Promise.all(videoList.map(async (video) => {
        if (!video.current_version_id) return null;
        try {
          const versions = await retryApiCall(() => VideoVersion.filter({ id: video.current_version_id }));
          return versions.length > 0 ? { ...video, currentVersion: versions[0] } : null;
        } catch {
          return null;
        }
      }));
      
      setVideos(videosWithVersions.filter(Boolean));
      
    } catch (error) {
      console.error("Error loading review data:", error);
      setError("Failed to load review. Please check the link and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = (noteText) => {
    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo || !currentVideo.currentVersion) return;

    const newNote = {
      video_version_id: currentVideo.currentVersion.id,
      timecode_ms: Date.now(),
      body: noteText,
      id: Date.now(),
      videoTitle: currentVideo.title
    };

    setNotes(prev => [...prev, newNote]);
    toast.success("Note added!");
  };

  const handleRemoveNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleSubmitNotes = async (reviewerName) => {
    if (notes.length === 0) {
      toast.info("No notes to submit. Click on the video to add a note.");
      return;
    }
    
    if (!project) return;
    toast.info("Submitting your feedback...");

    const batchId = Math.random().toString(36).substring(2);

    try {
      const notesToCreate = notes.map(note => ({
        video_version_id: note.video_version_id,
        timecode_ms: note.timecode_ms,
        body: note.body,
        submit_batch_id: batchId,
        reviewer_label: reviewerName || "Anonymous",
        status: 'pending',
        reviewer_ip: "0.0.0.0"
      }));
      
      await retryApiCall(() => Note.bulkCreate(notesToCreate));
      
      const videoIdsWithNotes = [...new Set(notes.map(note => {
        const version = videos.flatMap(v => v.currentVersion ? [v.currentVersion] : [])
          .find(ver => ver.id === note.video_version_id);
        
        if (!version) {
          console.error("Could not find version for note:", note);
          return null;
        }
        
        const video = videos.find(v => v.current_version_id === version.id);
        
        if (!video) {
          console.error("Could not find video for version:", version);
          return null;
        }
        
        return video.id;
      }).filter(Boolean))];

      for (const videoId of videoIdsWithNotes) {
        try {
          await retryApiCall(() => Video.update(videoId, { 
            status: "needs_changes" 
          }));
        } catch (error) {
          console.error(`Failed to update video ${videoId}:`, error);
        }
      }
      
      const anyProjectActive = videos.some(v => v.status === 'active' || v.status === 'pending_review');
      if (!anyProjectActive) {
          await retryApiCall(() => Project.update(project.id, {
              status: "pending",
              last_status_change_at: new Date().toISOString()
          }));
      }

      if (project.user_id) {
        await notifyNewFeedback(
          project.user_id,
          project.name,
          notes.length,
          reviewerName,
          project.id
        );
      }

      setNotes([]);
      toast.success("Feedback submitted successfully!");
      
      if (projectOwner?.email) {
        await SendEmail({
            to: projectOwner.email,
            from_name: reviewerName || "Editable Feedback",
            subject: `New feedback on "${project.name}"`,
            body: `${reviewerName || 'A client'} has submitted ${notes.length} new note(s) for your project "${project.name}".`
        }).catch(e => console.log("Could not send email notification:", e));
      }

    } catch (error) {
      console.error("Error submitting notes:", error);
      toast.error("Failed to submit notes. Please try again.");
    }
  };

  const handleApproveVideo = async (reviewerName) => {
    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo || !currentVideo.currentVersion || !project) return;
    toast.info("Approving video...");

    try {
      await retryApiCall(() => Approval.create({
        scope: "video",
        scope_id: currentVideo.id,
        version_id: currentVideo.currentVersion.id,
        approved_at: new Date().toISOString(),
        reviewer_label: reviewerName || "Anonymous"
      }));

      await retryApiCall(() => Video.update(currentVideo.id, { status: "approved" }));
      
      const updatedVideos = videos.map(v => v.id === currentVideo.id ? {...v, status: 'approved'} : v);
      setVideos(updatedVideos);
      
      const approvedCount = updatedVideos.filter(v => v.status === 'approved').length;
      
      if (project.user_id) {
        await notifyVideoApproval(
          project.user_id,
          currentVideo.title,
          project.name,
          reviewerName,
          project.id
        );
      }
      
      if (approvedCount === videos.length) {
          await retryApiCall(() => Project.update(project.id, { status: 'approved', approved_videos_count: approvedCount, last_status_change_at: new Date().toISOString() }));
          
          if (project.user_id) {
            await notifyProjectApproval(
              project.user_id,
              project.name,
              reviewerName,
              project.id
            );
          }
          
          if(projectOwner?.email) {
             await SendEmail({
                  to: projectOwner.email,
                  from_name: reviewerName || "Editable Feedback",
                  subject: `Project Approved: "${project.name}"`,
                  body: `Congratulations! All videos in your project "${project.name}" have been approved by ${reviewerName || 'the client'}.`
              }).catch(e => console.log("Could not send approval email:", e));
          }
      } else {
           await retryApiCall(() => Project.update(project.id, { approved_videos_count: approvedCount }));
           if(projectOwner?.email) {
             await SendEmail({
                  to: projectOwner.email,
                  from_name: reviewerName || "Editable Feedback",
                  subject: `Video Approved: "${currentVideo.title}"`,
                  body: `The video "${currentVideo.title}" in project "${project.name}" has been approved by ${reviewerName || 'the client'}.`
              }).catch(e => console.log("Could not send video approval email:", e));
           }
      }
      toast.success("Video approved! Thank you for your feedback.");
    } catch (error) {
      console.error("Error approving video:", error);
      toast.error("Failed to approve video. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 border-4 border-[rgb(var(--accent-primary))] border-t-transparent rounded-full animate-spin"></div>
          <p>Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-lg lg:text-xl font-bold text-white mb-2">Review Not Available</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm lg:text-base">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop Experience
  if (isDesktop) {
    return (
      <DesktopReviewInterface
        project={project}
        videos={videos}
        currentVideoIndex={currentVideoIndex}
        onVideoChange={setCurrentVideoIndex}
        notes={notes}
        onAddNote={handleAddNote}
        onRemoveNote={handleRemoveNote}
        onSubmitNotes={handleSubmitNotes}
        onApproveVideo={handleApproveVideo}
      />
    );
  }

  // Mobile Experience (existing)
  return (
    <div className="h-[100vh] h-screen bg-[rgb(var(--surface-dark))] flex flex-col overflow-hidden relative">
      <ReviewHeader project={project} />
      <main className="flex-1 pt-20 pb-28">
        {videos.length > 0 ? (
          <VideoCarousel
            videos={videos}
            currentIndex={currentVideoIndex}
            onIndexChange={setCurrentVideoIndex}
            isTypingNote={isQuickNoteOpen}
          />
        ) : (
           <div className="text-center text-white pt-20">No videos in this review.</div>
        )}
      </main>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass-effect border-t border-[rgb(var(--border-dark))]/30">
        <div className="flex items-center justify-around p-4 gap-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <Button
            onClick={() => setIsQuickNoteOpen(true)}
            className="flex-1 bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow px-4 py-3 h-12 rounded-xl font-medium shadow-lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Add Note
          </Button>
          
          <Button
            onClick={() => setIsActionsOpen(true)}
            variant="outline"
            className="flex-1 bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] text-white hover:bg-[rgb(var(--surface-dark))] px-4 py-3 h-12 rounded-xl font-medium shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Actions
          </Button>
        </div>
      </div>

      {/* Quick Note Popup */}
      <QuickNotePopup
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        onSave={handleAddNote}
        currentVideo={videos[currentVideoIndex]}
      />

      {/* Actions Popup */}
      <ActionsPopup
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onSubmitNotes={handleSubmitNotes}
        onApproveVideo={handleApproveVideo}
        currentVideo={videos[currentVideoIndex]}
        hasNotes={notes.length > 0}
      />
    </div>
  );
}
