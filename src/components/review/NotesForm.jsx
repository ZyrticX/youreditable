import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock,
  User,
  Trash2
} from "lucide-react";

export default function NotesForm({ 
  notes, 
  onSubmitNotes, 
  onApproveVideo, 
  currentVideo 
}) {
  const [reviewerName, setReviewerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimecode = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitNotes = async () => {
    if (notes.length === 0 && !reviewerName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitNotes(reviewerName);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApproveVideo(reviewerName);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Feedback & Approval
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {currentVideo?.title}
        </p>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {notes.length > 0 ? (
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-slate-900 text-sm">
              Notes for this video ({notes.length})
            </h4>
            {notes.map((note, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimecode(note.timecode)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes added yet</p>
            <p className="text-xs mt-1">Click "Add Note" on the video</p>
          </div>
        )}
      </div>

      {/* Reviewer Info & Actions */}
      <div className="p-4 border-t border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Name (Optional)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter your name"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          {notes.length > 0 && (
            <Button
              onClick={handleSubmitNotes}
              disabled={isSubmitting}
              className="w-full gradient-bg text-white hover:opacity-90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : `Submit ${notes.length} Note${notes.length !== 1 ? 's' : ''}`}
            </Button>
          )}
          
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isSubmitting ? "Approving..." : "Approve This Video"}
          </Button>
        </div>

        <div className="text-xs text-slate-500 text-center">
          <p>Your feedback will be sent to the project team</p>
        </div>
      </div>
    </div>
  );
}