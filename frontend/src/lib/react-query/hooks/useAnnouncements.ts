import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/lib/api/services/announcement.service';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from '@/lib/api/types';
import { toast } from 'react-hot-toast';

/**
 * Query keys for announcements
 */
export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (filters: any) => [...announcementKeys.lists(), { filters }] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: number) => [...announcementKeys.details(), id] as const,
  active: () => [...announcementKeys.lists(), 'active'] as const,
};

/**
 * Hook to fetch active announcements
 */
export const useActiveAnnouncements = () => {
  return useQuery({
    queryKey: announcementKeys.active(),
    queryFn: () => announcementService.getActiveAnnouncements(),
  });
};

/**
 * Hook to fetch all announcements (admin only)
 */
export const useAllAnnouncements = () => {
  return useQuery({
    queryKey: announcementKeys.lists(),
    queryFn: () => announcementService.getAllAnnouncements(),
  });
};

/**
 * Hook to fetch a specific announcement by ID
 */
export const useAnnouncement = (announcementId: number) => {
  return useQuery({
    queryKey: announcementKeys.detail(announcementId),
    queryFn: () => announcementService.getAnnouncementById(announcementId),
    enabled: !!announcementId,
  });
};

/**
 * Hook to create a new announcement (admin only)
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (announcementData: CreateAnnouncementInput) => 
      announcementService.createAnnouncement(announcementData),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate announcements queries
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        queryClient.invalidateQueries({ queryKey: announcementKeys.active() });
        toast.success('Announcement created successfully!');
      } else {
        toast.error(data.message || 'Failed to create announcement');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create announcement');
    },
  });
};

/**
 * Hook to update an existing announcement (admin only)
 */
export const useUpdateAnnouncement = (announcementId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (announcementData: UpdateAnnouncementInput) => 
      announcementService.updateAnnouncement(announcementId, announcementData),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate announcements queries
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        queryClient.invalidateQueries({ queryKey: announcementKeys.active() });
        queryClient.invalidateQueries({ queryKey: announcementKeys.detail(announcementId) });
        toast.success('Announcement updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update announcement');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update announcement');
    },
  });
};

/**
 * Hook to delete an announcement (admin only)
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (announcementId: number) => announcementService.deleteAnnouncement(announcementId),
    onSuccess: (data, announcementId) => {
      if (data.success) {
        // Invalidate announcements queries
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        queryClient.invalidateQueries({ queryKey: announcementKeys.active() });
        queryClient.invalidateQueries({ queryKey: announcementKeys.detail(announcementId) });
        toast.success('Announcement deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete announcement');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete announcement');
    },
  });
};
