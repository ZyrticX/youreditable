import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  MessageSquare,
  CheckCircle2,
  X,
  Plus,
  User,
  Clock,
  Send,
  ThumbsUp,
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Film
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function DesktopReviewInterface({
  project,
  videos,
  currentVideoIndex,
  onVideoChange,
  notes,
  onAddNote,
  onRemoveNote,
  onSubmitNotes,
  onApproveVideo
}) {
  const [newNote, setNewNote] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback"); // feedback, approve

  const currentVideo = videos[currentVideoIndex];

  const handleQuickNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote);
    setNewNote("");
  };

  const handleSubmit = () => {
    if (activeTab === "feedback") {
      onSubmitNotes(reviewerName);
    } else {
      onApproveVideo(reviewerName);
    }
    setShowSubmitForm(false);
    setReviewerName("");
  };

  const getVideoNotes = () => {
    if (!currentVideo?.currentVersion) return [];
    return notes.filter(note => note.video_version_id === currentVideo.currentVersion.id);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{project?.name}</h1>
              <p className="text-sm text-slate-400">Client Review Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-violet-300 border-violet-500/30">
              {currentVideoIndex + 1} of {videos.length}
            </Badge>
            <div className="text-sm text-slate-400">
              {project?.client_display_name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col bg-black/20">
          {/* Video Navigation */}
          <div className="bg-slate-800/50 px-6 py-3 flex items-center justify-between border-b border-slate-700/30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onVideoChange(Math.max(0, currentVideoIndex - 1))}
                disabled={currentVideoIndex === 0}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold text-white truncate max-w-md">
                {currentVideo?.title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onVideoChange(Math.min(videos.length - 1, currentVideoIndex + 1))}
                disabled={currentVideoIndex === videos.length - 1}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-slate-400">
              Version {currentVideo?.currentVersion?.version_number || 1}
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center p-8">
            {currentVideo?.currentVersion?.source_url ? (
              <div className="w-full h-full max-w-4xl max-h-full bg-black rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={currentVideo.currentVersion.source_url}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-slate-800 rounded-xl border-2 border-dashed border-slate-600">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  <p className="text-slate-400">No video available</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Thumbnails */}
          {videos.length > 1 && (
            <div className="bg-slate-800/30 px-6 py-4">
              <ScrollArea className="w-full">
                <div className="flex gap-3">
                  {videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => onVideoChange(index)}
                      className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentVideoIndex
                          ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <Film className="w-6 h-6 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Feedback Panel */}
        <div className="w-96 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 flex flex-col">
          {/* Panel Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Feedback Panel</h3>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activeTab === "feedback" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("feedback")}
                className={activeTab === "feedback" 
                  ? "bg-violet-600 hover:bg-violet-700 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Notes
              </Button>
              <Button
                variant={activeTab === "approve" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("approve")}
                className={activeTab === "approve" 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === "feedback" ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Note Input */}
                  <div className="p-6 border-b border-slate-700/30">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add your feedback for this video..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={handleQuickNote}
                        disabled={!newNote.trim()}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-200">
                        Notes ({getVideoNotes().length})
                      </h4>
                      {notes.length > 0 && (
                        <Button
                          onClick={() => setShowSubmitForm(true)}
                          size="sm"
                          className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit All
                        </Button>
                      )}
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="space-y-3">
                        {getVideoNotes().length > 0 ? (
                          getVideoNotes().map((note) => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-slate-200 leading-relaxed">
                                    {note.body}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    Just now
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemoveNote(note.id)}
                                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-6 w-6"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                            <p className="text-slate-400 text-sm">
                              No notes yet for this video
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              Add feedback above to get started
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="approve"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col p-6"
                >
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <ThumbsUp className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Approve This Video
                    </h4>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      Ready to approve "{currentVideo?.title}"? This will mark the video as finalized and notify the team.
                    </p>
                    <Button
                      onClick={() => setShowSubmitForm(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Video
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Submit Form Modal */}
      <AnimatePresence>
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeTab === "feedback" ? "Submit Feedback" : "Approve Video"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name (Optional)
                  </label>
                  <Input
                    placeholder="Enter your name..."
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSubmitForm(false)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className={`flex-1 ${
                      activeTab === "feedback" 
                        ? "bg-violet-600 hover:bg-violet-700" 
                        : "bg-emerald-600 hover:bg-emerald-700"
                    } text-white`}
                  >
                    {activeTab === "feedback" ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Notes
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}