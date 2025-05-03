using BookStore.Core.Common;
using BookStore.DTOs.Announcement;

namespace BookStore.Services.Announcement
{
    public interface IAnnouncementService
    {
        Task<Result<List<AnnouncementDTO>>> GetAllAnnouncementsAsync();
        Task<Result<List<AnnouncementDTO>>> GetActiveAnnouncementsAsync();
        Task<Result<AnnouncementDTO>> GetAnnouncementByIdAsync(int announcementId);
        Task<Result<AnnouncementDTO>> CreateAnnouncementAsync(string userId, CreateAnnouncementDTO createAnnouncementDto);
        Task<Result<AnnouncementDTO>> UpdateAnnouncementAsync(string userId, int announcementId, UpdateAnnouncementDTO updateAnnouncementDto);
        Task<Result<bool>> DeleteAnnouncementAsync(string userId, int announcementId);
    }
}
