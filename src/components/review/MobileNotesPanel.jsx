import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings } from "lucide-react";
import { motion } from "framer-motion";

import QuickNotePopup from "./QuickNotePopup";
import ActionsPopup from "./ActionsPopup";

export default function MobileNotesPanel({ 
  notes, 
  allNotes,
  onSubmitNotes, 
  onApproveVideo, 
  onRemoveNote,
  onAddNote,
  currentVideo,
  setIsTypingNote
}) {
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [reviewerName, setReviewerName] = useState("");

  const handleAddNoteClick = () => {
    setShowQuickNote(true);
    setIsTypingNote(true);
  };

  const handleCloseQuickNote = () => {
    setShowQuickNote(false);
    setIsTypingNote(false);
  };

  const handleSaveNote = (noteText) => {
    onAddNote(0, noteText); // Timecode will be managed elsewhere
    handleCloseQuickNote();
  };

  const handleActionsClick = () => {
    setShowActions(true);
  };

  const handleCloseActions = () => {
    setShowActions(false);
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-0 right-0 z-30 flex items-center justify-center gap-4 px-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleAddNoteClick} 
            className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow h-14 px-6 rounded-full font-medium shadow-lg flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Add Note
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleActionsClick} 
            className="bg-gray-700 hover:bg-gray-600 text-white h-14 px-6 rounded-full font-medium shadow-lg flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Actions
          </Button>
        </motion.div>
      </div>

      {/* Quick Note Popup */}
      <QuickNotePopup
        isVisible={showQuickNote}
        onSave={handleSaveNote}
        onClose={handleCloseQuickNote}
      />

      {/* Actions Popup */}
      <ActionsPopup
        isVisible={showActions}
        onClose={handleCloseActions}
        onSubmitNotes={onSubmitNotes}
        onApproveVideo={onApproveVideo}
        hasNotes={allNotes.length}
        reviewerName={reviewerName}
        setReviewerName={setReviewerName}
      />
    </>
  );
}