'use client';

import React, { useState, useEffect } from 'react';
import { useActiveAnnouncements } from '@/lib/react-query/hooks/useAnnouncements';
import { Announcement } from '@/lib/api/types';
import { X, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';

/**
 * Banner component to display active announcements
 */
const AnnouncementBanner: React.FC = () => {
  const { data } = useActiveAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const announcements = data?.success ? data.announcements : [];

  // Reset current index when announcements change
  useEffect(() => {
    setCurrentIndex(0);
  }, [announcements.length]);

  // Auto-rotate announcements every 8 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  // If no announcements or dismissed, don't render
  if (announcements.length === 0 || dismissed) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-[#2a9d8f] text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-center">
        <Megaphone className="h-5 w-5 mr-3 flex-shrink-0 text-white" />

        <div className="flex-1 text-center">
          <p className="text-sm md:text-base font-bold">{currentAnnouncement.message}</p>
        </div>

        {announcements.length > 1 && (
          <div className="flex items-center gap-1 ml-3">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              {currentIndex + 1}/{announcements.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Next announcement"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="ml-3 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss announcements"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
