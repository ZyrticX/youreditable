import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Clock,
    AlertCircle,
    CheckCircle2,
    Archive,
    Loader2,
    Link as LinkIcon,
    Save,
    Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Video as VideoEntity } from '@/api/entities';
import { Note } from '@/api/entities';
import { Approval } from '@/api/entities';
import { VideoVersion } from '@/api/entities';

// Helper function for timecode formatting
const formatTimecode = (ms) => {
    if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Extract file ID from Google Drive URL
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

export default function VideoExpansionPanel({ video, project, onUpdate, isArchived }) {
    const [notes, setNotes] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [isSavingLink, setIsSavingLink] = useState(false);

    // Function to load all necessary data for the panel from the database
    const loadVideoData = async () => {
        setIsLoading(true);
        try {
            if (!video.current_version_id) {
                toast.error("This video has no version assigned.");
                setIsLoading(false);
                setCurrentVersion(null); // Ensure currentVersion is null if no version ID
                return;
            }
            // 1. Fetch the current video version
            const versions = await VideoVersion.filter({ id: video.current_version_id });
            const version = versions[0];
            setCurrentVersion(version);

            if (version) {
                // 2. Fetch notes for that specific version
                const versionNotes = await Note.filter({ video_version_id: version.id }, "-created_at");
                setNotes(versionNotes);
            } else {
                setNotes([]);
            }
            
            // 3. Fetch approvals for the video
            const videoApprovals = await Approval.filter({ scope: "video", scope_id: video.id }, "-created_at");
            setApprovals(videoApprovals);

        } catch (error) {
            console.error('Failed to load video data:', error);
            toast.error('Failed to load video details.');
            setNotes([]);
            setApprovals([]);
            setCurrentVersion(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data when component mounts or video.id changes
    useEffect(() => {
        if (video?.id) {
            loadVideoData();
        }
    }, [video?.id]);

    const handleStatusChange = async (newStatus) => {
        if (isArchived) {
            toast.error("Cannot modify archived projects.");
            return;
        }

        try {
            await VideoEntity.update(video.id, {
                status: newStatus
                // הוסר last_status_change_at - יתעדכן אוטומטית בטריגר
            });
            toast.success(`Video marked as ${newStatus.replace('_', ' ')}.`);
            onUpdate?.(); // Callback to parent to refresh project data or videos
        } catch (error) {
            console.error('Failed to update video status:', error);
            toast.error('Failed to update video status.');
        }
    };

    const handleNoteStatusToggle = async (noteId, currentStatus) => {
        if (isArchived) {
            toast.error("Cannot modify archived projects.");
            return;
        }

        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        
        try {
            await Note.update(noteId, { status: newStatus });
            
            // Update local state
            setNotes(prev => prev.map(note => 
                note.id === noteId ? { ...note, status: newStatus } : note
            ));
            
            toast.success(`Note marked as ${newStatus}.`);
        } catch (error) {
            console.error('Failed to update note status:', error);
            toast.error('Failed to update note status.');
        }
    };

    const handleUpdateVideoLink = async () => {
        if (isArchived) {
            toast.error("Cannot modify archived projects.");
            return;
        }

        if (!newVideoUrl.trim()) {
            toast.error("Please enter a valid Google Drive URL.");
            return;
        }

        const fileId = extractFileId(newVideoUrl);
        if (!fileId) {
            toast.error("Invalid Google Drive URL format.");
            return;
        }

        setIsSavingLink(true);
        try {
            // Create new version with updated link
            const existingVersions = await VideoVersion.filter({ video_id: video.id });
            const currentVersionNumber = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version_number)) : 0;

            const newVersion = await VideoVersion.create({
                video_id: video.id,
                version_number: currentVersionNumber + 1,
                source_type: 'drive',
                source_url: `https://drive.google.com/file/d/${fileId}/preview`,
                file_id: fileId,
                thumbnail_url: null // Will be updated by backend if available
            });

            // Update video to use new version
            await VideoEntity.update(video.id, { 
                current_version_id: newVersion.id,
                status: 'pending_review'
            });

            toast.success(`Video updated to Version ${currentVersionNumber + 1}`);
            setIsEditingLink(false);
            setNewVideoUrl('');
            onUpdate?.(); // Refresh parent data
            loadVideoData(); // Reload data for the panel to show the new version
            
        } catch (error) {
            console.error('Failed to update video link:', error);
            toast.error('Failed to update video link.');
        } finally {
            setIsSavingLink(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]"
        >
            <div className="p-4 sm:p-6 space-y-6">
                {isArchived && (
                    <div className="p-3 bg-gray-900/50 border border-gray-600/50 rounded-lg">
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            This video cannot be modified because the project is archived.
                        </p>
                    </div>
                )}

                {/* Update Video Link Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">Video Source</h4>
                        {!isArchived && !isEditingLink && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingLink(true)}
                                className="text-sm"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Update Video
                            </Button>
                        )}
                    </div>
                </div>

                {/* Video Link Update Form - Renders when isEditingLink is true */}
                {isEditingLink && !isArchived && (
                    <div className="p-4 bg-[rgb(var(--surface-dark))] rounded-lg space-y-3">
                        <Label htmlFor="video-url" className="text-sm font-medium text-white">
                            New Google Drive Video URL
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                id="video-url"
                                value={newVideoUrl}
                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                className="flex-1 bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]"
                                disabled={isSavingLink}
                            />
                            <Button
                                onClick={handleUpdateVideoLink}
                                disabled={isSavingLink || !newVideoUrl.trim()}
                                className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 w-full sm:w-auto"
                            >
                                {isSavingLink ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                            This will create a new version and notify clients of the update.
                        </p>
                    </div>
                )}

                {/* Video Preview */}
                {isLoading ? (
                     <div className="w-full aspect-video bg-[rgb(var(--surface-dark))] rounded-xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[rgb(var(--accent-primary))] animate-spin" />
                    </div>
                ) : currentVersion ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">Current Version ({currentVersion.version_number})</h4>
                        </div>

                        <div className="bg-[rgb(var(--surface-dark))] rounded-xl overflow-hidden">
                            <iframe
                                src={currentVersion.source_url}
                                className="w-full aspect-video"
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title={`Video Preview for ${video.title}`}
                            />
                        </div>
                    </div>
                ) : (
                     <div className="w-full aspect-video bg-[rgb(var(--surface-dark))] rounded-xl flex items-center justify-center">
                        <p className="text-sm text-[rgb(var(--text-secondary))]">No video version found.</p>
                    </div>
                )}

                {/* Status Change Buttons - Disabled for archived projects */}
                <div className="space-y-3">
                    <h4 className="font-medium text-white">Video Status</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={() => handleStatusChange('pending_review')}
                            disabled={isArchived || isLoading}
                            variant={video.status === 'pending_review' ? 'default' : 'outline'}
                            size="sm"
                            className={`${video.status === 'pending_review' ? 'bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white' : ''} w-full sm:w-auto`}
                        >
                            <Clock className="w-4 h-4 mr-1" />
                            Pending Review
                        </Button>
                        <Button
                            onClick={() => handleStatusChange('needs_changes')}
                            disabled={isArchived || isLoading}
                            variant={video.status === 'needs_changes' ? 'default' : 'outline'}
                            size="sm"
                            className={`${video.status === 'needs_changes' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''} w-full sm:w-auto`}
                        >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Needs Changes
                        </Button>
                        <Button
                            onClick={() => handleStatusChange('approved')}
                            disabled={isArchived || isLoading}
                            variant={video.status === 'approved' ? 'default' : 'outline'}
                            size="sm"
                            className={`${video.status === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : ''} w-full sm:w-auto`}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approved
                        </Button>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-3">
                    <h4 className="font-medium text-white">Client Feedback ({notes.length})</h4>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-6 bg-[rgb(var(--surface-dark))] rounded-lg">
                            <Loader2 className="w-5 h-5 text-[rgb(var(--text-secondary))] animate-spin" />
                        </div>
                    ) : notes.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto p-1">
                            {notes.map((note) => (
                                <div key={note.id} className="p-3 bg-[rgb(var(--surface-dark))] rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            <span className="text-sm font-medium text-blue-300">
                                                {note.reviewer_label || 'Client'}
                                            </span>
                                            {note.timecode_ms !== undefined && (
                                                <span className="text-xs text-[rgb(var(--text-secondary))]">
                                                    @{formatTimecode(note.timecode_ms)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2">
                                            {!isArchived && (
                                                <Checkbox
                                                    checked={note.status === 'completed'}
                                                    onCheckedChange={() => handleNoteStatusToggle(note.id, note.status)}
                                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 flex-shrink-0"
                                                />
                                            )}
                                            <Badge variant={note.status === 'completed' ? 'default' : 'secondary'} className={`text-xs flex-shrink-0 ${note.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                                                {note.status === 'completed' ? 'Done' : 'Pending'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[rgb(var(--text-primary))] break-words">{note.body}</p>
                                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-2">
                                        {format(new Date(note.created_at), "MMM d, h:mm a")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-[rgb(var(--text-secondary))] text-center py-6 bg-[rgb(var(--surface-dark))] rounded-lg">
                            No feedback received yet for this version.
                        </div>
                    )}
                </div>

                {/* Approvals Section */}
                <div className="space-y-3">
                     <h4 className="font-medium text-white">Approvals ({approvals.length})</h4>
                    {isLoading ? (
                         <div className="flex justify-center items-center py-6 bg-[rgb(var(--surface-dark))] rounded-lg">
                            <Loader2 className="w-5 h-5 text-[rgb(var(--text-secondary))] animate-spin" />
                        </div>
                    ) : approvals.length > 0 ? (
                        <div className="space-y-2">
                            {approvals.map((approval) => (
                                <div key={approval.id} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span className="text-sm font-medium text-green-300 break-words">
                                            {approval.reviewer_label || 'Client'} approved this video
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-400">
                                        {format(new Date(approval.approved_at), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-[rgb(var(--text-secondary))] text-center py-6 bg-[rgb(var(--surface-dark))] rounded-lg">
                            No approvals recorded for this video.
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}