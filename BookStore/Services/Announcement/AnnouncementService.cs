using AutoMapper;
using BookStore.Core.Common;
using BookStore.DTOs.Announcement;
using BookStore.Repository.Announcement;
using BookStore.Services.Notification;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Services.Announcement
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AnnouncementService> _logger;
        private readonly UserManager<Entities.User> _userManager;
        private readonly INotificationService _notificationService;

        public AnnouncementService(
            IAnnouncementRepository announcementRepository,
            IMapper mapper,
            ILogger<AnnouncementService> logger,
            UserManager<Entities.User> userManager,
            INotificationService notificationService)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _logger = logger;
            _userManager = userManager;
            _notificationService = notificationService;
        }

        public async Task<Result<List<AnnouncementDTO>>> GetAllAnnouncementsAsync()
        {
            try
            {
                var announcements = await _announcementRepository.GetAllAnnouncementsAsync();
                var announcementDtos = _mapper.Map<List<AnnouncementDTO>>(announcements);
                return Result<List<AnnouncementDTO>>.SuccessResult(announcementDtos, "Announcements retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all announcements");
                return Result<List<AnnouncementDTO>>.FailureResult("Failed to get announcements: " + ex.Message);
            }
        }

        public async Task<Result<List<AnnouncementDTO>>> GetActiveAnnouncementsAsync()
        {
            try
            {
                var announcements = await _announcementRepository.GetActiveAnnouncementsAsync();
                var announcementDtos = _mapper.Map<List<AnnouncementDTO>>(announcements);
                return Result<List<AnnouncementDTO>>.SuccessResult(announcementDtos, "Active announcements retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active announcements");
                return Result<List<AnnouncementDTO>>.FailureResult("Failed to get active announcements: " + ex.Message);
            }
        }

        public async Task<Result<AnnouncementDTO>> GetAnnouncementByIdAsync(int announcementId)
        {
            try
            {
                var announcement = await _announcementRepository.GetAnnouncementByIdAsync(announcementId);
                if (announcement == null)
                {
                    return Result<AnnouncementDTO>.FailureResult($"Announcement with ID {announcementId} not found");
                }

                var announcementDto = _mapper.Map<AnnouncementDTO>(announcement);
                return Result<AnnouncementDTO>.SuccessResult(announcementDto, "Announcement retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting announcement with ID {AnnouncementId}", announcementId);
                return Result<AnnouncementDTO>.FailureResult("Failed to get announcement: " + ex.Message);
            }
        }

        public async Task<Result<AnnouncementDTO>> CreateAnnouncementAsync(string userId, CreateAnnouncementDTO createAnnouncementDto)
        {
            try
            {
                // Validate dates
                if (createAnnouncementDto.EndTime <= createAnnouncementDto.StartTime)
                {
                    return Result<AnnouncementDTO>.FailureResult("End time must be after start time");
                }

                // Get the user
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Result<AnnouncementDTO>.FailureResult("User not found");
                }

                // Create announcement
                var announcement = new Entities.Announcement
                {
                    Message = createAnnouncementDto.Message,
                    StartTime = createAnnouncementDto.StartTime.ToUniversalTime(),
                    EndTime = createAnnouncementDto.EndTime.ToUniversalTime(),
                    CreatedBy = user
                };

                // Save announcement
                var createdAnnouncement = await _announcementRepository.AddAnnouncementAsync(announcement);

                // Map to DTO
                var announcementDto = _mapper.Map<AnnouncementDTO>(createdAnnouncement);

                // Broadcast announcement if it's active now
                var now = DateTime.UtcNow;
                if (announcement.StartTime <= now && announcement.EndTime >= now)
                {
                    await _notificationService.BroadcastAnnouncementAsync(announcement.Message);
                }

                return Result<AnnouncementDTO>.SuccessResult(announcementDto, "Announcement created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement by user {UserId}", userId);
                return Result<AnnouncementDTO>.FailureResult("Failed to create announcement: " + ex.Message);
            }
        }

        public async Task<Result<AnnouncementDTO>> UpdateAnnouncementAsync(string userId, int announcementId, UpdateAnnouncementDTO updateAnnouncementDto)
        {
            try
            {
                // Validate dates
                if (updateAnnouncementDto.EndTime <= updateAnnouncementDto.StartTime)
                {
                    return Result<AnnouncementDTO>.FailureResult("End time must be after start time");
                }

                // Get the announcement
                var announcement = await _announcementRepository.GetAnnouncementByIdAsync(announcementId);
                if (announcement == null)
                {
                    return Result<AnnouncementDTO>.FailureResult($"Announcement with ID {announcementId} not found");
                }

                // Update announcement
                announcement.Message = updateAnnouncementDto.Message;
                announcement.StartTime = updateAnnouncementDto.StartTime.ToUniversalTime();
                announcement.EndTime = updateAnnouncementDto.EndTime.ToUniversalTime();

                // Save announcement
                var updatedAnnouncement = await _announcementRepository.UpdateAnnouncementAsync(announcement);

                // Map to DTO
                var announcementDto = _mapper.Map<AnnouncementDTO>(updatedAnnouncement);

                return Result<AnnouncementDTO>.SuccessResult(announcementDto, "Announcement updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating announcement with ID {AnnouncementId} by user {UserId}", announcementId, userId);
                return Result<AnnouncementDTO>.FailureResult("Failed to update announcement: " + ex.Message);
            }
        }

        public async Task<Result<bool>> DeleteAnnouncementAsync(string userId, int announcementId)
        {
            try
            {
                // Get the announcement
                var announcement = await _announcementRepository.GetAnnouncementByIdAsync(announcementId);
                if (announcement == null)
                {
                    return Result<bool>.FailureResult($"Announcement with ID {announcementId} not found");
                }

                // Delete announcement
                var success = await _announcementRepository.DeleteAnnouncementAsync(announcementId);
                if (!success)
                {
                    return Result<bool>.FailureResult("Failed to delete announcement");
                }

                return Result<bool>.SuccessResult(true, "Announcement deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting announcement with ID {AnnouncementId} by user {UserId}", announcementId, userId);
                return Result<bool>.FailureResult("Failed to delete announcement: " + ex.Message);
            }
        }
    }
}
