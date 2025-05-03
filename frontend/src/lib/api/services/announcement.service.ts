import { apiClient } from '../client';
import { AnnouncementResponse, AnnouncementDetailResponse, AnnouncementListResponse, CreateAnnouncementInput, UpdateAnnouncementInput } from '../types';

/**
 * Announcement service for handling announcement-related operations
 */
export const announcementService = {
  /**
   * Get active announcements
   * @returns Promise with active announcements
   */
  getActiveAnnouncements: async (): Promise<AnnouncementListResponse> => {
    try {
      const response = await apiClient.get('/Announcement');

      console.log('Active announcements response:', response.data);

      return {
        success: true,
        announcements: response.data.announcements || []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch announcements',
        announcements: []
      };
    }
  },

  /**
   * Get all announcements (admin only)
   * @returns Promise with all announcements
   */
  getAllAnnouncements: async (): Promise<AnnouncementListResponse> => {
    try {
      const response = await apiClient.get('/Announcement/all');

      return {
        success: true,
        announcements: response.data.announcements || []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch all announcements',
        announcements: []
      };
    }
  },

  /**
   * Get a specific announcement by ID
   * @param announcementId - Announcement ID
   * @returns Promise with announcement details
   */
  getAnnouncementById: async (announcementId: number): Promise<AnnouncementDetailResponse> => {
    try {
      const response = await apiClient.get(`/Announcement/${announcementId}`);

      return {
        success: true,
        announcement: response.data.announcement
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch announcement',
        announcement: null
      };
    }
  },

  /**
   * Create a new announcement (admin only)
   * @param announcementData - Announcement data to create
   * @returns Promise with created announcement
   */
  createAnnouncement: async (announcementData: CreateAnnouncementInput): Promise<AnnouncementDetailResponse> => {
    try {
      const response = await apiClient.post('/Announcement', announcementData);

      return {
        success: true,
        message: 'Announcement created successfully',
        announcement: response.data.announcement
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create announcement',
        announcement: null
      };
    }
  },

  /**
   * Update an existing announcement (admin only)
   * @param announcementId - Announcement ID to update
   * @param announcementData - Updated announcement data
   * @returns Promise with updated announcement
   */
  updateAnnouncement: async (announcementId: number, announcementData: UpdateAnnouncementInput): Promise<AnnouncementDetailResponse> => {
    try {
      const response = await apiClient.put(`/Announcement/${announcementId}`, announcementData);

      return {
        success: true,
        message: 'Announcement updated successfully',
        announcement: response.data.announcement
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update announcement',
        announcement: null
      };
    }
  },

  /**
   * Delete an announcement (admin only)
   * @param announcementId - Announcement ID to delete
   * @returns Promise with deletion result
   */
  deleteAnnouncement: async (announcementId: number): Promise<AnnouncementResponse> => {
    try {
      await apiClient.delete(`/Announcement/${announcementId}`);

      return {
        success: true,
        message: 'Announcement deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete announcement'
      };
    }
  }
};
