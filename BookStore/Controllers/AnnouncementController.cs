using BookStore.DTOs.Announcement;
using BookStore.Services.Announcement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;
        private readonly ILogger<AnnouncementController> _logger;

        public AnnouncementController(IAnnouncementService announcementService, ILogger<AnnouncementController> logger)
        {
            _announcementService = announcementService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            try
            {
                var result = await _announcementService.GetActiveAnnouncementsAsync();
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, announcements = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active announcements");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAnnouncements()
        {
            try
            {
                var result = await _announcementService.GetAllAnnouncementsAsync();
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, announcements = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all announcements");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAnnouncementById(int id)
        {
            try
            {
                var result = await _announcementService.GetAnnouncementByIdAsync(id);
                if (!result.Success)
                {
                    return NotFound(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, announcement = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting announcement {AnnouncementId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDTO createAnnouncementDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                var result = await _announcementService.CreateAnnouncementAsync(userId, createAnnouncementDto);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return CreatedAtAction(nameof(GetAnnouncementById), new { id = result.Data.Id }, new { success = true, announcement = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] UpdateAnnouncementDTO updateAnnouncementDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                var result = await _announcementService.UpdateAnnouncementAsync(userId, id, updateAnnouncementDto);
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                    {
                        return NotFound(new { success = false, message = result.Message });
                    }
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, announcement = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating announcement {AnnouncementId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            try
            {
                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                var result = await _announcementService.DeleteAnnouncementAsync(userId, id);
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                    {
                        return NotFound(new { success = false, message = result.Message });
                    }
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, message = "Announcement deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting announcement {AnnouncementId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }
    }
}
