using BookStore.Entities;

namespace BookStore.Repository.Announcement
{
    public interface IAnnouncementRepository
    {
        Task<IEnumerable<Entities.Announcement>> GetAllAnnouncementsAsync();
        Task<IEnumerable<Entities.Announcement>> GetActiveAnnouncementsAsync();
        Task<Entities.Announcement?> GetAnnouncementByIdAsync(int announcementId);
        Task<Entities.Announcement> AddAnnouncementAsync(Entities.Announcement announcement);
        Task<Entities.Announcement> UpdateAnnouncementAsync(Entities.Announcement announcement);
        Task<bool> DeleteAnnouncementAsync(int announcementId);
    }
}
