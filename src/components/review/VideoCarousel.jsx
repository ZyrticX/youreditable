import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The VideoPlayer component is refactored to prevent unmounting the iframe.
// It now shows an overlay on top of the video when a note is being added.
const VideoPlayer = ({ video, isActive, isTypingNote }) => {
  if (!video || !video.currentVersion) return null;

  const { source_url } = video.currentVersion;

  return (
    <div className="relative w-full h-full bg-black">
      {/* The iframe is now always mounted, preserving its state (like playback time). */}
      <iframe
        key={video.id} // Use a stable key to prevent re-renders
        src={source_url}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={video.title}
      />

      {/* This overlay appears on top of the video, instead of replacing it. */}
      <AnimatePresence>
        {isTypingNote && (
          <motion.div
            key="typing-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            transition={{ duration: 0.2 }}
          >
            <div className="bg-black/70 text-white px-5 py-3 rounded-xl text-center shadow-lg">
              <p className="text-sm font-medium">✍️ Adding note...</p>
              <p className="text-xs text-gray-400 mt-1">Video is paused in background</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function VideoCarousel({
  videos,
  currentIndex,
  onIndexChange,
  isTypingNote
}) {
  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -100 || velocity < -500) {
      if (currentIndex < videos.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    } else if (offset > 100 || velocity > 500) {
      if (currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < videos.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false}>
            <motion.div
                key={currentIndex}
                className="absolute top-4 bottom-28 left-2 right-2 rounded-2xl overflow-hidden bg-black shadow-lg"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <VideoPlayer
                    video={videos[currentIndex]}
                    isActive={true}
                    isTypingNote={isTypingNote}
                />

                {/* Navigation Buttons */}
                {currentIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm w-10 h-10 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}

                {currentIndex < videos.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm w-10 h-10 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}

                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <div className="bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h2 className="font-bold text-lg text-white drop-shadow-md">{videos[currentIndex]?.title}</h2>
                        <p className="text-sm text-gray-300 drop-shadow-md">{currentIndex + 1} of {videos.length}</p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
}