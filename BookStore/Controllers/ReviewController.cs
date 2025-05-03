using BookStore.DTOs.Review;
using BookStore.Services.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewController> _logger;

        public ReviewController(IReviewService reviewService, ILogger<ReviewController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        [HttpGet("book/{bookId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByBookId(int bookId)
        {
            try
            {
                var result = await _reviewService.GetReviewsByBookIdAsync(bookId);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, reviews = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for book {BookId}", bookId);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetReviewsByUser()
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

                var result = await _reviewService.GetReviewsByUserIdAsync(userId);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, reviews = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for user");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewById(int id)
        {
            try
            {
                var result = await _reviewService.GetReviewByIdAsync(id);
                if (!result.Success)
                {
                    return NotFound(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, review = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review {ReviewId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDTO createReviewDto)
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

                var result = await _reviewService.CreateReviewAsync(userId, createReviewDto);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return CreatedAtAction(nameof(GetReviewById), new { id = result.Data.Id }, new { success = true, review = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for book {BookId}", createReviewDto.BookId);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDTO updateReviewDto)
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

                var result = await _reviewService.UpdateReviewAsync(userId, id, updateReviewDto);
                if (!result.Success)
                {
                    if (result.Message.Contains("permission"))
                    {
                        return Forbid();
                    }
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, review = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review {ReviewId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
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

                var result = await _reviewService.DeleteReviewAsync(userId, id);
                if (!result.Success)
                {
                    if (result.Message.Contains("permission"))
                    {
                        return Forbid();
                    }
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("check-purchase/{bookId}")]
        [Authorize]
        public async Task<IActionResult> CheckBookPurchase(int bookId)
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

                _logger.LogInformation("Checking purchase status for user {UserId} and book {BookId}", userId, bookId);

                var result = await _reviewService.HasUserPurchasedBookAsync(userId, bookId);
                if (!result.Success)
                {
                    _logger.LogWarning("Purchase check failed: {Message}", result.Message);
                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("Purchase check result for user {UserId} and book {BookId}: {HasPurchased}",
                    userId, bookId, result.Data);

                return Ok(new {
                    success = true,
                    hasPurchased = result.Data,
                    message = result.Data ? "User has purchased this book" : "User has not purchased this book"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user has purchased book {BookId}", bookId);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost("refresh-purchase-status/{bookId}")]
        [Authorize]
        public async Task<IActionResult> RefreshPurchaseStatus(int bookId)
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

                _logger.LogInformation("Force refreshing purchase status for user {UserId} and book {BookId}", userId, bookId);

                // Clear any caches in the service layer (if applicable)

                // Check purchase status with cache bypass
                var result = await _reviewService.HasUserPurchasedBookAsync(userId, bookId, true);
                if (!result.Success)
                {
                    _logger.LogWarning("Purchase status refresh failed: {Message}", result.Message);
                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("Refreshed purchase status for user {UserId} and book {BookId}: {HasPurchased}",
                    userId, bookId, result.Data);

                return Ok(new {
                    success = true,
                    hasPurchased = result.Data,
                    message = result.Data
                        ? "Purchase status refreshed: User has purchased this book"
                        : "Purchase status refreshed: User has not purchased this book"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing purchase status for book {BookId}", bookId);
                return StatusCode(500, new { success = false, message = "An error occurred while refreshing purchase status" });
            }
        }
    }
}
