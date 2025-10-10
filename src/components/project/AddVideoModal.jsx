import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { googleDrive } from '@/api/functions';
import { Video } from '@/api/entities';
import { VideoVersion } from '@/api/entities';

// Helper to extract file ID from various Google Drive URL formats
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

export default function AddVideoModal({ isOpen, onOpenChange, project, videos, onUpdate }) {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      setError('Please enter a valid Google Drive URL.');
      return;
    }

    const fileId = extractFileId(newVideoUrl);
    if (!fileId) {
      setError('The URL does not seem to be a valid Google Drive file link.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await googleDrive({ fileId });
      const fileDetails = response.data;

      if (fileDetails.status !== 'success' || !fileDetails.file) {
        throw new Error(fileDetails.message || 'Could not retrieve video details from Google Drive.');
      }

      const { file: driveVideoData } = fileDetails;
      
      const highestOrderIndex = videos.length > 0 ? Math.max(...videos.map(v => v.order_index || 0)) : 0;

      // 1. Create Video entity
      const newVideo = await Video.create({
        project_id: project.id,
        title: driveVideoData.title,
        order_index: highestOrderIndex + 1,
        status: 'pending_review',
      });

      // 2. Create VideoVersion entity
      const newVersion = await VideoVersion.create({
        video_id: newVideo.id,
        version_number: 1,
        source_type: 'drive',
        source_url: driveVideoData.previewUrl,
        file_id: driveVideoData.id,
        thumbnail_url: driveVideoData.thumbnailLink,
      });

      // 3. Update the video with the current version ID
      await Video.update(newVideo.id, {
        current_version_id: newVersion.id,
      });

      toast.success(`"${driveVideoData.title}" was successfully added to the project.`);
      onUpdate(); // Trigger a re-fetch of project data on the parent page
      onOpenChange(false); // Close the modal
      setNewVideoUrl(''); // Reset the input

    } catch (err) {
      console.error('Failed to add video:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error('Failed to add video.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal closes
  const handleOpenChange = (open) => {
    if (!open) {
        setNewVideoUrl('');
        setError('');
        setIsLoading(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
            Add New Video to Project
          </DialogTitle>
          <DialogDescription className="text-[rgb(var(--text-secondary))] pt-1">
            Paste the Google Drive URL of the video you want to add. Works with publicly shared files.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-[rgb(var(--text-primary))]">
              Google Drive Video URL
            </Label>
            <Input
              id="video-url"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[rgb(var(--surface-dark))] hover:bg-gray-600 text-white border border-[rgb(var(--border-dark))]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddVideo}
            disabled={isLoading || !newVideoUrl.trim()}
            className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Video...
              </>
            ) : (
              'Add Video'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}