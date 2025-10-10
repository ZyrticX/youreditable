import { Notification } from "@/api/entities";
import { createPageUrl } from "@/utils";

// Helper to create notifications safely
const createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (error) {
    console.error("Failed to create notification:", error);
    // Optionally, add more robust error handling or retry logic here
  }
};

// --- Notification Templates ---

export const notifyNewFeedback = (userId, projectName, noteCount, reviewerName, projectId) => {
  return createNotification({
    user_id: userId,
    type: 'new_feedback',
    title: `New Feedback on ${projectName}`,
    message: `${reviewerName || 'A client'} left ${noteCount} new note(s).`, // תוקן מ-body ל-message
    data: { link: createPageUrl(`Project?id=${projectId}`) } // moved to data object
  });
};

export const notifyVideoApproval = (userId, videoTitle, projectName, reviewerName, projectId) => {
  return createNotification({
    user_id: userId,
    type: 'video_approved',
    title: `Video Approved: ${videoTitle}`,
    message: `${reviewerName || 'A client'} approved a video in the project "${projectName}".`, // תוקן מ-body ל-message
    data: { link: createPageUrl(`Project?id=${projectId}`) } // moved to data object
  });
};

export const notifyProjectApproval = (userId, projectName, reviewerName, projectId) => {
  return createNotification({
    user_id: userId,
    type: 'project_approved',
    title: `Project Approved: ${projectName}`,
    message: `Congratulations! ${reviewerName || 'A client'} approved all videos.`, // תוקן מ-body ל-message
    data: { link: createPageUrl(`Project?id=${projectId}`) } // moved to data object
  });
};

export const notifyNewVersion = (userId, videoTitle, versionNumber, projectName, projectId) => {
    return createNotification({
        user_id: userId,
        type: 'new_version',
        title: `New Version Uploaded`,
        body: `Version ${versionNumber} of "${videoTitle}" is now available in the project "${projectName}".`,
        link: createPageUrl(`Project?id=${projectId}`)
    });
};