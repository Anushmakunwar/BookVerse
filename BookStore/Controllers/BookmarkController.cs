using BookStore.DTOs.BookMark;
using BookStore.Services.BookMark;
using BookStore.Repository.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookmarkController : ControllerBase
{
    private readonly IBookMarkService _bookmarkService;
    private readonly ILogger<BookmarkController> _logger;
    private readonly IUserRepository _userRepository;
    private readonly UserManager<Entities.User> _userManager;

    public BookmarkController(IBookMarkService bookmarkService, ILogger<BookmarkController> logger, IUserRepository userRepository, UserManager<Entities.User> userManager)
    {
        _bookmarkService = bookmarkService;
        _logger = logger;
        _userRepository = userRepository;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookmarks()
    {
        // Get the user ID from the claims
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            _logger.LogWarning("User ID claim not found in claims");
            return Unauthorized();
        }

        // Check if user is an admin - admins should not use bookmarks
        var user = await _userManager.FindByIdAsync(userIdClaim);
        if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Forbid("Admin users cannot use bookmarks");
        }

        // Get the member profile for the user
        var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userIdClaim);
        if (memberProfile == null)
        {
            _logger.LogWarning("Member profile not found for user ID: {UserId}", userIdClaim);
            return BadRequest(new { message = "Member profile not found" });
        }

        try
        {
            _logger.LogInformation("Getting bookmarks for member ID: {MemberId}", memberProfile.Id);
            var bookmarks = await _bookmarkService.GetBookmarksAsync(memberProfile.Id);
            return Ok(bookmarks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bookmarks for member ID: {MemberId}", memberProfile.Id);
            return StatusCode(500, new { success = false, message = "Failed to get bookmarks", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddBookmark([FromBody] CreateBookMarkDTO createBookmarkDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Get the user ID from the claims
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            _logger.LogWarning("User ID claim not found in claims");
            return Unauthorized();
        }

        // Check if user is an admin - admins should not use bookmarks
        var user = await _userManager.FindByIdAsync(userIdClaim);
        if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Forbid("Admin users cannot use bookmarks");
        }

        // Get the member profile for the user
        var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userIdClaim);
        if (memberProfile == null)
        {
            _logger.LogWarning("Member profile not found for user ID: {UserId}", userIdClaim);
            return BadRequest(new { message = "Member profile not found" });
        }

        try
        {
            _logger.LogInformation("Adding bookmark for book ID: {BookId} and member ID: {MemberId}",
                createBookmarkDto.BookId, memberProfile.Id);

            await _bookmarkService.AddBookmarkAsync(memberProfile.Id, createBookmarkDto.BookId);
            return Ok(new { success = true, message = "Bookmark added successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding bookmark for book ID: {BookId} and member ID: {MemberId}",
                createBookmarkDto.BookId, memberProfile.Id);

            return StatusCode(500, new { success = false, message = "Failed to add bookmark", error = ex.Message });
        }
    }

    [HttpDelete("{bookmarkId}")]
    public async Task<IActionResult> RemoveBookmark(int bookmarkId)
    {
        // Get the user ID from the claims
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            _logger.LogWarning("User ID claim not found in claims");
            return Unauthorized();
        }

        // Check if user is an admin - admins should not use bookmarks
        var user = await _userManager.FindByIdAsync(userIdClaim);
        if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Forbid("Admin users cannot use bookmarks");
        }

        // Get the member profile for the user
        var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userIdClaim);
        if (memberProfile == null)
        {
            _logger.LogWarning("Member profile not found for user ID: {UserId}", userIdClaim);
            return BadRequest(new { message = "Member profile not found" });
        }

        try
        {
            _logger.LogInformation("Attempting to delete bookmark with ID {BookmarkId} for user {UserId}", bookmarkId, userIdClaim);

            // First try to get the bookmark to verify ownership
            try
            {
                var bookmark = await _bookmarkService.GetBookmarkByIdAsync(bookmarkId);

                if (bookmark != null)
                {
                    _logger.LogInformation("Found bookmark with ID {BookmarkId}, BookId: {BookId}, MemberProfileId: {MemberId}",
                        bookmarkId, bookmark.BookId, bookmark.MemberProfileId);

                    // Verify ownership
                    if (bookmark.MemberProfileId != memberProfile.Id)
                    {
                        _logger.LogWarning("Bookmark with ID {BookmarkId} does not belong to user {UserId}", bookmarkId, memberProfile.Id);
                        return NotFound(new { message = "Bookmark not found or does not belong to the user" });
                    }

                    // If we have the book ID, try to delete by book ID and member ID first
                    await _bookmarkService.RemoveBookmarkAsync(memberProfile.Id, bookmark.BookId);
                    _logger.LogInformation("Successfully deleted bookmark by book ID {BookId} and member ID {MemberId}",
                        bookmark.BookId, memberProfile.Id);
                    return Ok(new { success = true, message = "Bookmark removed successfully" });
                }
                else
                {
                    _logger.LogWarning("Bookmark with ID {BookmarkId} not found, attempting direct deletion", bookmarkId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting or deleting bookmark by book ID, falling back to direct deletion");
            }

            // If we couldn't delete by book ID or the bookmark wasn't found, try direct deletion
            _logger.LogInformation("Attempting direct deletion of bookmark with ID {BookmarkId}", bookmarkId);
            await _bookmarkService.DeleteBookmarkAsync(bookmarkId);
            _logger.LogInformation("Successfully deleted bookmark with ID {BookmarkId}", bookmarkId);

            return Ok(new { success = true, message = "Bookmark removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing bookmark {BookmarkId}", bookmarkId);
            return StatusCode(500, new { success = false, message = "Failed to remove bookmark", error = ex.Message });
        }
    }

    [HttpDelete("ByBookId/{bookId}")]
    public async Task<IActionResult> RemoveBookmarkByBookId(int bookId)
    {
        // Get the user ID from the claims
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            _logger.LogWarning("User ID claim not found in claims");
            return Unauthorized();
        }

        // Check if user is an admin - admins should not use bookmarks
        var user = await _userManager.FindByIdAsync(userIdClaim);
        if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Forbid("Admin users cannot use bookmarks");
        }

        // Get the member profile for the user
        var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userIdClaim);
        if (memberProfile == null)
        {
            _logger.LogWarning("Member profile not found for user ID: {UserId}", userIdClaim);
            return BadRequest(new { message = "Member profile not found" });
        }

        try
        {
            _logger.LogInformation("Removing bookmark for book ID: {BookId} and member ID: {MemberId}",
                bookId, memberProfile.Id);

            await _bookmarkService.RemoveBookmarkAsync(memberProfile.Id, bookId);
            return Ok(new { success = true, message = "Bookmark removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing bookmark for book ID: {BookId} and member ID: {MemberId}",
                bookId, memberProfile.Id);

            return StatusCode(500, new { success = false, message = "Failed to remove bookmark", error = ex.Message });
        }
    }

    [HttpGet("Check/{bookId}")]
    public async Task<IActionResult> CheckBookmark(int bookId)
    {
        // Get the user ID from the claims
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            _logger.LogWarning("User ID claim not found in claims");
            return Unauthorized();
        }

        // Check if user is an admin - admins should not use bookmarks
        var user = await _userManager.FindByIdAsync(userIdClaim);
        if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Forbid("Admin users cannot use bookmarks");
        }

        // Get the member profile for the user
        var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userIdClaim);
        if (memberProfile == null)
        {
            _logger.LogWarning("Member profile not found for user ID: {UserId}", userIdClaim);
            return BadRequest(new { message = "Member profile not found" });
        }

        try
        {
            _logger.LogInformation("Checking if book ID: {BookId} is bookmarked by member ID: {MemberId}",
                bookId, memberProfile.Id);

            // Get all bookmarks for the user
            var bookmarks = await _bookmarkService.GetBookmarksAsync(memberProfile.Id);

            // Check if the book is bookmarked
            var isBookmarked = bookmarks.Any(b => b.BookId == bookId);

            // If bookmarked, get the bookmark ID
            int? bookmarkId = null;
            if (isBookmarked)
            {
                bookmarkId = bookmarks.First(b => b.BookId == bookId).Id;
            }

            return Ok(new { isBookmarked, bookmarkId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking bookmark for book ID: {BookId} and member ID: {MemberId}",
                bookId, memberProfile.Id);

            return StatusCode(500, new { success = false, message = "Failed to check bookmark", error = ex.Message });
        }
    }
}
