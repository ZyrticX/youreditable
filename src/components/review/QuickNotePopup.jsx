import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

export default function QuickNotePopup({ 
  isOpen, 
  onClose, 
  onSave,
  currentVideo 
}) {
  const [noteText, setNoteText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure popup is fully rendered
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (noteText.trim()) {
      onSave(noteText.trim());
      setNoteText('');
      onClose();
    }
  };

  const handleClose = () => {
    setNoteText('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

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
            onClick={handleClose}
          />
          
          {/* Popup - Fixed positioning */}
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
                <h3 className="font-semibold text-white">Quick Note</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-[rgb(var(--text-secondary))] hover:text-white w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your feedback here..."
                  className="w-full h-20 px-3 py-2 bg-[rgb(var(--surface-dark))] border border-[rgb(var(--border-dark))] rounded-lg text-white placeholder-[rgb(var(--text-secondary))] resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent"
                  style={{
                    fontSize: '16px', // Prevents zoom on iOS
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                />
                
                {/* Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-[rgb(var(--border-dark))] text-[rgb(var(--text-secondary))] hover:text-white hover:bg-[rgb(var(--surface-dark))]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!noteText.trim()}
                    className="flex-1 bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save
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