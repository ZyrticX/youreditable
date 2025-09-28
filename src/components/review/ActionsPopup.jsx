import React from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, X } from "lucide-react";

export default function ActionsPopup({ 
  isOpen, 
  onClose, 
  onSubmitNotes,
  onApproveVideo,
  currentVideo,
  hasNotes 
}) {
  const [reviewerName, setReviewerName] = React.useState('');

  const handleSubmitNotes = () => {
    onSubmitNotes(reviewerName || 'Anonymous');
    onClose();
  };

  const handleApproveVideo = () => {
    onApproveVideo(reviewerName || 'Anonymous');
    onClose();
  };

  const isVideoApproved = currentVideo?.status === 'approved';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ type: "spring", duration: 0.2 }}
            className="fixed bottom-32 left-4 right-4 z-50"
          >
            <div className="bg-[rgb(var(--surface-light))] rounded-2xl shadow-2xl border border-[rgb(var(--border-dark))] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border-dark))]">
                <h3 className="font-semibold text-white">Actions</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-[rgb(var(--text-secondary))] hover:text-white w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Reviewer Name Input */}
                <div>
                  <label className="text-sm text-[rgb(var(--text-secondary))] mb-2 block">
                    Your name (optional)
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-3 py-2 bg-[rgb(var(--surface-dark))] border border-[rgb(var(--border-dark))] rounded-lg text-white placeholder-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent"
                    style={{
                      fontSize: '16px', // Prevents zoom on iOS
                      WebkitAppearance: 'none'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {hasNotes && (
                    <Button
                      onClick={handleSubmitNotes}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Notes
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleApproveVideo}
                    disabled={isVideoApproved}
                    className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isVideoApproved ? 'Video Approved' : 'Approve Video'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}