using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Repository.Announcement
{
    public class AnnouncementRepository : IAnnouncementRepository
    {
        private readonly BookStoreDBContext _context;
        private readonly ILogger<AnnouncementRepository> _logger;

        public AnnouncementRepository(BookStoreDBContext context, ILogger<AnnouncementRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Entities.Announcement>> GetAllAnnouncementsAsync()
        {
            try
            {
                return await _context.Announcements
                    .Include(a => a.CreatedBy)
                    .OrderByDescending(a => a.StartTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all announcements");
                throw;
            }
        }

        public async Task<IEnumerable<Entities.Announcement>> GetActiveAnnouncementsAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                return await _context.Announcements
                    .Include(a => a.CreatedBy)
                    .Where(a => a.StartTime <= now && a.EndTime >= now)
                    .OrderByDescending(a => a.StartTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active announcements");
                throw;
            }
        }

        public async Task<Entities.Announcement?> GetAnnouncementByIdAsync(int announcementId)
        {
            try
            {
                return await _context.Announcements
                    .Include(a => a.CreatedBy)
                    .FirstOrDefaultAsync(a => a.Id == announcementId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting announcement with ID {AnnouncementId}", announcementId);
                throw;
            }
        }

        public async Task<Entities.Announcement> AddAnnouncementAsync(Entities.Announcement announcement)
        {
            try
            {
                _context.Announcements.Add(announcement);
                await _context.SaveChangesAsync();
                return announcement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding announcement");
                throw;
            }
        }

        public async Task<Entities.Announcement> UpdateAnnouncementAsync(Entities.Announcement announcement)
        {
            try
            {
                _context.Announcements.Update(announcement);
                await _context.SaveChangesAsync();
                return announcement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating announcement with ID {AnnouncementId}", announcement.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAnnouncementAsync(int announcementId)
        {
            try
            {
                var announcement = await _context.Announcements.FindAsync(announcementId);
                if (announcement == null)
                {
                    return false;
                }

                _context.Announcements.Remove(announcement);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting announcement with ID {AnnouncementId}", announcementId);
                throw;
            }
        }
    }
}
