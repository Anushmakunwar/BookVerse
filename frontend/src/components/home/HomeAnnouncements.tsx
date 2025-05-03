'use client';

import React from 'react';
import { useActiveAnnouncements } from '@/lib/react-query/hooks/useAnnouncements';
import { Megaphone } from 'lucide-react';

/**
 * Component to display announcements on the home page
 */
const HomeAnnouncements: React.FC = () => {
  const { data, isLoading } = useActiveAnnouncements();
  
  if (isLoading || !data?.success || !data.announcements || data.announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Megaphone className="h-6 w-6 mr-2 text-primary" />
        Announcements
      </h2>
      
      <div className="space-y-4">
        {data.announcements.map((announcement) => (
          <div 
            key={announcement.id} 
            className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary"
          >
            <p className="text-lg font-medium">{announcement.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeAnnouncements;
