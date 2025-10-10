
import React, { useState, useEffect } from "react";
// Project management will be handled through Supabase database
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Play,
  Loader2,
  RefreshCw,
  ExternalLink,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
// Google Drive integration will be handled through Supabase Edge Functions
import { googleDrive, getUserGoogleToken, downloadVideoFromDrive, listDriveFiles } from '@/api/functions';
import { Project, Video, VideoVersion } from '@/api/entities';
import { useUser } from '../components/auth/UserProvider';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used for toasts

// Define project limits based on plan tiers
const PLAN_PROJECT_LIMITS = {
  free: 3,
  basic: 12,
  pro: Infinity // Unlimited for Pro users
};

export default function Import() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [step, setStep] = useState(1); // 1: URL, 2: Preview, 3: Settings, 4: Creating
  const [driveUrl, setDriveUrl] = useState("");
  const [folderId, setFolderId] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState({});
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [permissionError, setPermissionError] = useState(null); // Will hold {status, message, folderId}
  const [userProjects, setUserProjects] = useState([]); // Track user's projects for limit checking

  // Load user's projects on component mount to check limits
  useEffect(() => {
    if (user?.id) {
      loadUserProjects();
    }
  }, [user?.id]);

  const loadUserProjects = async () => {
    try {
      const projects = await Project.filter({ user_id: user.id });
      setUserProjects(projects);
    } catch (error) {
      console.error('Failed to load user projects:', error);
      setUserProjects([]);
    }
  };

  // Check if user can create a new project
  const canCreateProject = () => {
    // For now, allow unlimited projects since we don't have plan management set up yet
    // TODO: Add plan management with Supabase user metadata
    return true;
  };

  const getUpgradeMessage = () => {
    return `Project limit reached. Please upgrade your plan for more projects.`;
  };

  const extractFolderId = (url) => {
    // Handle all Google Drive folder URL formats
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]{10,})/,
      /[?&]id=([a-zA-Z0-9_-]{10,})/,
      /^([a-zA-Z0-9_-]{25,})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const importFromDriveFolder = async (folderId) => {
    try {
      console.log('📁 Listing files in folder:', folderId);
      
      // Get user's Google access token
      const accessToken = await getUserGoogleToken();
      console.log('🔑 Access token available:', !!accessToken);
      
      // Use the new list-drive-files Edge Function
      const response = await listDriveFiles({ folderId, accessToken });
      console.log('📊 List files response:', response);
      
      return response.data;
    } catch (error) {
      console.error('💥 Drive import error:', error);
      return {
        status: "error",
        message: error.message || "Failed to connect to Google Drive. Please try again."
      };
    }
  };

  const handleUrlSubmit = async () => {
    console.log('🚀 handleUrlSubmit called with URL:', driveUrl);
    
    if (!driveUrl.trim()) {
      console.log('❌ No URL provided');
      setError("Please enter a Google Drive folder URL.");
      return;
    }

    const id = extractFolderId(driveUrl);
    console.log('📁 Extracted folder ID:', id);
    
    if (!id) {
      console.log('❌ Invalid folder ID');
      setError("Invalid Google Drive folder URL. Please check the format and try again.");
      return;
    }

    console.log('⏳ Starting import process...');
    setIsLoading(true);
    setError("");
    setPermissionError(null);
    setFolderId(id);

    try {
      const result = await importFromDriveFolder(id);
      console.log('📊 Import result:', result);
      processImportResult(result);
    } catch (error) {
      console.error('💥 Import failed:', error);
      setError(error.message || 'Import failed');
    }

    setIsLoading(false);
  };

  const handleRescanFolder = async () => {
    if (!folderId) return;
    setIsLoading(true);
    setError("");
    setPermissionError(null);
    const result = await importFromDriveFolder(folderId);
    processImportResult(result);
    setIsLoading(false);
  };

  const processImportResult = (result) => {
    if (result.status === "success") {
        setVideos(result.videos || []);
        const selections = {};
        (result.videos || []).forEach(video => {
            selections[video.id] = true;
        });
        setSelectedVideos(selections);
        setProjectName("Video Review Project");
        setStep(2);
        
        // Show message if no videos found but folder access was successful
        if (!result.videos || result.videos.length === 0) {
          if (result.message) {
            setError(result.message);
          } else {
            setError("No video files found in this folder. Make sure the folder contains video files or is publicly shared.");
          }
        }
    } else if (result.status === "permission_required") {
        setPermissionError(result);
        setStep(1); // Stay on step 1 to show the error
    } else if (result.status === "folder_not_found") {
        setError("The link looks wrong or we can't access it. Check the URL and try again.");
    } else {
        setError(result.message || "An unknown error occurred."); // Use result.message for error details
    }
  };


  const handleVideoToggle = (videoId) => {
    setSelectedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const getSelectedCount = () => {
    return Object.values(selectedVideos).filter(Boolean).length;
  };

  const handleCreateProject = async () => {
    // Check project limit before proceeding
    if (!canCreateProject()) {
      setError(getUpgradeMessage());
      toast.error(getUpgradeMessage());
      return;
    }

    if (!projectName.trim() || !clientName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!user || !user.id) {
      setError("User authentication required. Please log in.");
      return;
    }

    const selectedVideoList = videos.filter(video => selectedVideos[video.id]);
    if (selectedVideoList.length === 0) {
      setError("Please select at least one video");
      return;
    }

    setStep(4);
    setIsLoading(true);

    try {
      const shareToken = generateUUID().replace(/-/g, '').substring(0, 32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create project in Supabase
      const project = await Project.create({
        name: projectName,
        client_display_name: clientName,
        user_id: user.id,
        share_token: shareToken,
        share_expires_at: expiresAt.toISOString(),
        status: "active"
      });
      
      // Create videos and download them to Supabase Storage
      for (let i = 0; i < selectedVideoList.length; i++) {
        const video = selectedVideoList[i];
        
        // Create video record with pending status
        const newVideo = await Video.create({
          project_id: project.id,
          title: video.title || `Video ${i + 1}`,
          order_index: i + 1,
          file_id: video.id, // Google Drive file ID
          status: "processing" // Processing while downloading
        });
        
        try {
          // Download video from Google Drive to Supabase Storage
          const accessToken = await getUserGoogleToken();
          const downloadResult = await downloadVideoFromDrive({
            fileId: video.id,
            fileName: video.title || `video_${i + 1}.mp4`,
            accessToken,
            userId: user.id,
            projectId: project.id
          });

          if (downloadResult.success) {
            // Create video version with Supabase Storage URL
            const newVersion = await VideoVersion.create({
              video_id: newVideo.id,
              version_number: 1,
              source_url: downloadResult.data.fileUrl, // Supabase Storage URL - תוקן!
              thumbnail_url: downloadResult.data.thumbnailUrl,
              file_size: downloadResult.data.fileSize,
              mime_type: downloadResult.data.mimeType,
              storage_path: downloadResult.data.storagePath,
              status: "active"
            });

            // Update video status to pending_review AND set current_version_id
            await Video.update(newVideo.id, { 
              status: "pending_review", // תוקן - סרטון מוכן לביקורת
              current_version_id: newVersion.id
            });
            
            console.log(`✅ Video ${video.title} downloaded and stored successfully`);
          } else {
            throw new Error(downloadResult.error || 'Download failed');
          }
        } catch (downloadError) {
          console.error(`Failed to download video ${video.title}:`, downloadError);
          
          // Fallback: Create version with Google Drive URL
          const fallbackVersion = await VideoVersion.create({
            video_id: newVideo.id,
            version_number: 1,
            source_url: video.previewUrl, // Fallback to Google Drive preview - תוקן!
            thumbnail_url: video.thumbnailLink,
            file_size: video.size || null,
            mime_type: video.mimeType || 'video/mp4',
            status: "active"
          });

          // Update video status to pending_review but with warning
          await Video.update(newVideo.id, { 
            status: "pending_review", // תוקן - גם fallback מוכן לביקורת
            current_version_id: fallbackVersion.id,
            notes: "Video stored as Google Drive link (download failed)"
          });
          
          console.warn(`⚠️ Video ${video.title} stored as Google Drive link`);
        }
      }

      // After successful project creation, reload projects to update the count
      await loadUserProjects();

      navigate(createPageUrl(`Project?id=${project.id}`));
    } catch (err) {
      console.error("Project creation error:", err);
      setError("Failed to create project. Please try again.");
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate current usage for display
  const userPlan = user?.plan_level || 'free';
  const maxProjects = PLAN_PROJECT_LIMITS[userPlan];
  const projectsUsed = userProjects.length;

  return (
    <div className="p-4 lg:p-8 bg-[rgb(var(--surface-dark))] text-[rgb(var(--text-primary))] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
          {/* Only show back button on desktop */}
          <div className="hidden lg:block">
            <Link to={createPageUrl("Projects")}>
              <Button variant="outline" size="icon" className="min-w-[44px] min-h-[44px]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Import from Google Drive
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[rgb(var(--text-secondary))]">Create a new project from your Drive folder</p>
              {maxProjects !== Infinity && (
                <div className="text-sm text-[rgb(var(--text-secondary))]">
                  <span className="font-medium text-white">{projectsUsed}</span>
                  <span className="mx-1">of</span>
                  <span className="font-medium text-white">{maxProjects}</span>
                  <span className="ml-1">projects used</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Limit Warning */}
        {!canCreateProject() && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-200 font-medium">Project Limit Reached</h3>
                <p className="text-red-300 text-sm mt-1">{getUpgradeMessage()}</p>
              </div>
              <Button variant="outline" size="sm" className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30">
                Upgrade Plan
              </Button>
            </div>
          </div>
        )}

        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= stepNum
                    ? 'bg-[rgb(var(--accent-primary))] text-white'
                    : 'bg-[rgb(var(--surface-light))] text-[rgb(var(--text-secondary))]'
                }`}>
                  {step > stepNum ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 lg:w-24 h-0.5 mx-2 transition-colors ${
                    step > stepNum ? 'bg-[rgb(var(--accent-primary))]' : 'bg-[rgb(var(--surface-light))]'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-lg mx-auto mt-3 text-xs lg:text-sm text-[rgb(var(--text-secondary))]">
            <span>Drive URL</span>
            <span>Preview</span>
            <span>Settings</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {permissionError && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
             <CardHeader>
                <CardTitle className="text-red-300">We can't read this folder yet.</CardTitle>
                <AlertDescription className="text-red-400">
                  {permissionError.message}
                </AlertDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleRescanFolder} variant="outline" disabled={isLoading} className="flex-1">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Rescan
                </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="shadow-lg border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 brand-gradient rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <CardTitle className="text-xl lg:text-2xl font-bold">
                Connect Google Drive Folder
              </CardTitle>
              <p className="text-[rgb(var(--text-secondary))] mt-2">
                Import videos from your Google Drive folder to create a review project
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="drive-url" className="text-sm font-medium">
                  Google Drive Folder URL
                </Label>
                <div className="relative">
                  <Input
                    id="drive-url"
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="pr-12 h-12 text-sm"
                    disabled={isLoading || !canCreateProject()}
                  />
                  <ExternalLink className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-secondary))]" />
                </div>
              </div>

              <Button
                onClick={handleUrlSubmit}
                disabled={!driveUrl.trim() || isLoading || !canCreateProject()}
                className={`w-full h-12 text-base font-medium ${
                  canCreateProject()
                    ? 'bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting to Drive...
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Import Videos
                  </>
                )}
              </Button>

              {!canCreateProject() && (
                <p className="text-sm text-red-400 text-center">Project limit reached. Please archive projects or upgrade your plan to continue.</p>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-lg border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl lg:text-2xl font-bold">
                    Select Videos to Import
                  </CardTitle>
                  <p className="text-[rgb(var(--text-secondary))] mt-1">
                    Found {videos.length} video{videos.length !== 1 ? 's' : ''} • {getSelectedCount()} selected
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRescanFolder}
                  disabled={isLoading}
                  className="min-w-[44px] min-h-[44px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rescan
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {videos.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-4 p-4 bg-[rgb(var(--surface-dark))] rounded-xl hover:bg-gray-900/50 transition-colors duration-200"
                      >
                        <Checkbox
                          checked={selectedVideos[video.id] || false}
                          onCheckedChange={() => handleVideoToggle(video.id)}
                          className="min-w-[20px] min-h-[20px]"
                        />

                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[rgb(var(--surface-light))] border border-[rgb(var(--border-dark))] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play className="w-4 h-4 lg:w-5 lg:h-5 text-[rgb(var(--text-secondary))]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {video.title}
                          </h4>
                           <p className="text-sm text-[rgb(var(--text-secondary))] truncate">{video.name}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[rgb(var(--accent-primary))] hover:text-violet-400 hover:bg-violet-500/10 min-w-[44px] min-h-[44px]"
                          onClick={() => window.open(video.previewUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-[rgb(var(--border-dark))]">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="min-h-[48px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {getSelectedCount() > 0 && (
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow min-h-[48px]"
                  >
                    Continue with {getSelectedCount()} video{getSelectedCount() !== 1 ? 's' : ''}
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-lg border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl lg:text-2xl font-bold">
                Project Settings
              </CardTitle>
              <p className="text-[rgb(var(--text-secondary))] mt-2">
                Configure your project details and client information
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-sm font-medium">
                    Project Name *
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Brand Commercial Q1 2024"
                    className="h-12"
                    disabled={!canCreateProject()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-name" className="text-sm font-medium">
                    Client Display Name *
                  </Label>
                  <Input
                    id="client-name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="h-12"
                    disabled={!canCreateProject()}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-violet-900/30 to-blue-900/30 rounded-xl border border-[rgb(var(--border-dark))]">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-1">
                  <li>• Your project will be created with {getSelectedCount()} video{getSelectedCount() !== 1 ? 's' : ''}</li>
                  <li>• A secure 7-day review link will be generated</li>
                  <li>• You can share the link with clients for feedback</li>
                  <li>• Clients can leave time-stamped notes without signing up</li>
                </ul>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-[rgb(var(--border-dark))]">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="min-h-[48px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || !clientName.trim() || isLoading || !canCreateProject()}
                  className={`min-h-[48px] ${
                    canCreateProject()
                      ? 'bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Project
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="text-center py-12 bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
            <CardContent>
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 bg-violet-500/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 text-[rgb(var(--accent-primary))] animate-spin" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-2">Creating Project</h3>
              <p className="text-[rgb(var(--text-secondary))]">Setting up your videos and review links...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
