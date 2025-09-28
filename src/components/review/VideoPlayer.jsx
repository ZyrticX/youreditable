import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Plus,
  ExternalLink
} from "lucide-react";

export default function VideoPlayer({ video, onAddNote }) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [timecode, setTimecode] = useState("0:00");
  const iframeRef = useRef(null);

  const parseTimecode = (timecodeStr) => {
    const parts = timecodeStr.split(':').map(Number);
    if (parts.length === 1) {
      return parts[0] * 1000; // seconds to ms
    } else if (parts.length === 2) {
      return (parts[0] * 60 + parts[1]) * 1000; // mm:ss to ms
    } else if (parts.length === 3) {
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000; // hh:mm:ss to ms
    }
    return 0;
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    
    const timecodeMs = parseTimecode(timecode);
    onAddNote(timecodeMs, noteText);
    setNoteText("");
    setShowNoteInput(false);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {video?.currentVersion ? (
        <>
          <iframe
            ref={iframeRef}
            src={video.currentVersion.source_url}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          
          {/* Note Input Overlay */}
          {showNoteInput && (
            <div className="absolute bottom-6 left-6 right-6 bg-white rounded-lg shadow-xl p-4 max-w-md mx-auto">
              <h4 className="font-medium text-slate-900 mb-3">Add Note</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Timestamp
                  </label>
                  <Input
                    value={timecode}
                    onChange={(e) => setTimecode(e.target.value)}
                    placeholder="e.g. 1:23, 0:45, 2:30:15"
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Format: seconds (45), mm:ss (1:23), or hh:mm:ss (2:30:15)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter your feedback..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNoteInput(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="gradient-bg text-white hover:opacity-90"
                >
                  Add Note
                </Button>
              </div>
            </div>
          )}
          
          {/* Add Note Button */}
          {!showNoteInput && (
            <Button
              onClick={() => setShowNoteInput(true)}
              className="absolute bottom-6 left-6 gradient-bg text-white hover:opacity-90 shadow-lg"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          )}
          
          {/* Open in Drive Button */}
          <Button
            variant="outline"
            onClick={() => window.open(video.currentVersion.source_url, '_blank')}
            className="absolute bottom-6 right-6 bg-white hover:bg-slate-50 shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Drive
          </Button>
        </>
      ) : (
        <div className="text-white text-center">
          <p className="text-lg mb-2">No video available</p>
          <p className="text-slate-400">Please check the video source</p>
        </div>
      )}
    </div>
  );
}