using AutoMapper;
using BookStore.Core.Common;
using BookStore.DTOs.Review;
using BookStore.Repository.Book;
using BookStore.Repository.Review;
using BookStore.Repository.User;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Services.Review
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IUserRepository _userRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ReviewService> _logger;
        private readonly UserManager<Entities.User> _userManager;

        public ReviewService(
            IReviewRepository reviewRepository,
            IUserRepository userRepository,
            IBookRepository bookRepository,
            IMapper mapper,
            ILogger<ReviewService> logger,
            UserManager<Entities.User> userManager)
        {
            _reviewRepository = reviewRepository;
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _mapper = mapper;
            _logger = logger;
            _userManager = userManager;
        }

        public async Task<Result<List<ReviewDTO>>> GetReviewsByBookIdAsync(int bookId)
        {
            try
            {
                // Check if book exists
                var book = await _bookRepository.GetByIdAsync(bookId);
                if (book == null)
                {
                    return Result<List<ReviewDTO>>.FailureResult($"Book with ID {bookId} not found");
                }

                // Get reviews
                var reviews = await _reviewRepository.GetReviewsByBookIdAsync(bookId);

                // Map to DTOs
                var reviewDtos = _mapper.Map<List<ReviewDTO>>(reviews);

                return Result<List<ReviewDTO>>.SuccessResult(reviewDtos, "Reviews retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for book {BookId}", bookId);
                return Result<List<ReviewDTO>>.FailureResult("Failed to get reviews: " + ex.Message);
            }
        }

        public async Task<Result<List<ReviewDTO>>> GetReviewsByUserIdAsync(string userId)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<List<ReviewDTO>>.FailureResult("Member profile not found");
                }

                // Get reviews
                var reviews = await _reviewRepository.GetReviewsByMemberIdAsync(memberProfile.Id);

                // Map to DTOs
                var reviewDtos = _mapper.Map<List<ReviewDTO>>(reviews);

                return Result<List<ReviewDTO>>.SuccessResult(reviewDtos, "Reviews retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for user {UserId}", userId);
                return Result<List<ReviewDTO>>.FailureResult("Failed to get reviews: " + ex.Message);
            }
        }

        public async Task<Result<ReviewDTO>> GetReviewByIdAsync(int reviewId)
        {
            try
            {
                // Get review
                var review = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (review == null)
                {
                    return Result<ReviewDTO>.FailureResult($"Review with ID {reviewId} not found");
                }

                // Map to DTO
                var reviewDto = _mapper.Map<ReviewDTO>(review);

                return Result<ReviewDTO>.SuccessResult(reviewDto, "Review retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review with ID {ReviewId}", reviewId);
                return Result<ReviewDTO>.FailureResult("Failed to get review: " + ex.Message);
            }
        }

        public async Task<Result<ReviewDTO>> CreateReviewAsync(string userId, CreateReviewDTO createReviewDto)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<ReviewDTO>.FailureResult("Member profile not found");
                }

                // Check if book exists
                var book = await _bookRepository.GetByIdAsync(createReviewDto.BookId);
                if (book == null)
                {
                    return Result<ReviewDTO>.FailureResult($"Book with ID {createReviewDto.BookId} not found");
                }

                // Check if the user has purchased the book
                var hasPurchased = await _reviewRepository.HasMemberPurchasedBookAsync(memberProfile.Id, createReviewDto.BookId);
                if (!hasPurchased)
                {
                    // Check if user is an admin (admins can review any book)
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user == null || !await _userManager.IsInRoleAsync(user, "Admin"))
                    {
                        return Result<ReviewDTO>.FailureResult("You can only review books you have purchased");
                    }
                }

                // Check if the user has already reviewed this book
                var existingReview = await _reviewRepository.GetReviewByBookAndMemberAsync(createReviewDto.BookId, memberProfile.Id);
                if (existingReview != null)
                {
                    return Result<ReviewDTO>.FailureResult("You have already reviewed this book");
                }

                // Create review
                var review = new Entities.Review
                {
                    BookId = createReviewDto.BookId,
                    MemberProfileId = memberProfile.Id,
                    Rating = createReviewDto.Rating,
                    Comment = createReviewDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                // Save review
                var createdReview = await _reviewRepository.AddReviewAsync(review);

                // Map to DTO
                var reviewDto = _mapper.Map<ReviewDTO>(createdReview);
                reviewDto.BookTitle = book.Title;
                reviewDto.MemberName = memberProfile.User.FullName;

                return Result<ReviewDTO>.SuccessResult(reviewDto, "Review created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for book {BookId} by user {UserId}", createReviewDto.BookId, userId);
                return Result<ReviewDTO>.FailureResult("Failed to create review: " + ex.Message);
            }
        }

        public async Task<Result<ReviewDTO>> UpdateReviewAsync(string userId, int reviewId, UpdateReviewDTO updateReviewDto)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<ReviewDTO>.FailureResult("Member profile not found");
                }

                // Get review
                var review = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (review == null)
                {
                    return Result<ReviewDTO>.FailureResult($"Review with ID {reviewId} not found");
                }

                // Check if the review belongs to the user
                if (review.MemberProfileId != memberProfile.Id)
                {
                    // Check if user is an admin (admins can update any review)
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user == null || !await _userManager.IsInRoleAsync(user, "Admin"))
                    {
                        return Result<ReviewDTO>.FailureResult("You do not have permission to update this review");
                    }
                }

                // Update review
                review.Rating = updateReviewDto.Rating;
                review.Comment = updateReviewDto.Comment;

                // Save review
                var updatedReview = await _reviewRepository.UpdateReviewAsync(review);

                // Map to DTO
                var reviewDto = _mapper.Map<ReviewDTO>(updatedReview);

                return Result<ReviewDTO>.SuccessResult(reviewDto, "Review updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review with ID {ReviewId} by user {UserId}", reviewId, userId);
                return Result<ReviewDTO>.FailureResult("Failed to update review: " + ex.Message);
            }
        }

        public async Task<Result<bool>> DeleteReviewAsync(string userId, int reviewId)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<bool>.FailureResult("Member profile not found");
                }

                // Get review
                var review = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (review == null)
                {
                    return Result<bool>.FailureResult($"Review with ID {reviewId} not found");
                }

                // Check if the review belongs to the user
                if (review.MemberProfileId != memberProfile.Id)
                {
                    // Check if user is an admin (admins can delete any review)
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user == null || !await _userManager.IsInRoleAsync(user, "Admin"))
                    {
                        return Result<bool>.FailureResult("You do not have permission to delete this review");
                    }
                }

                // Delete review
                var success = await _reviewRepository.DeleteReviewAsync(reviewId);
                if (!success)
                {
                    return Result<bool>.FailureResult("Failed to delete review");
                }

                return Result<bool>.SuccessResult(true, "Review deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review with ID {ReviewId} by user {UserId}", reviewId, userId);
                return Result<bool>.FailureResult("Failed to delete review: " + ex.Message);
            }
        }

        public async Task<Result<bool>> HasUserPurchasedBookAsync(string userId, int bookId, bool bypassCache = false)
        {
            try
            {
                _logger.LogInformation("Checking if user {UserId} has purchased book {BookId} (bypassCache: {BypassCache})",
                    userId, bookId, bypassCache);

                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    _logger.LogWarning("Member profile not found for user {UserId}", userId);
                    return Result<bool>.FailureResult("Member profile not found");
                }

                _logger.LogInformation("Found member profile with ID {MemberProfileId} for user {UserId}",
                    memberProfile.Id, userId);

                // Check if book exists
                var book = await _bookRepository.GetByIdAsync(bookId);
                if (book == null)
                {
                    _logger.LogWarning("Book with ID {BookId} not found", bookId);
                    return Result<bool>.FailureResult($"Book with ID {bookId} not found");
                }

                // Check if user is an admin (admins can review any book)
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    _logger.LogInformation("User {UserId} is an admin, allowing review for any book", userId);
                    return Result<bool>.SuccessResult(true, "Admin users can review any book");
                }

                // Check if the user has purchased the book
                _logger.LogInformation("Checking if member {MemberProfileId} has purchased book {BookId}",
                    memberProfile.Id, bookId);

                var hasPurchased = await _reviewRepository.HasMemberPurchasedBookAsync(memberProfile.Id, bookId);

                if (hasPurchased)
                {
                    _logger.LogInformation("User {UserId} (member {MemberProfileId}) has purchased book {BookId}",
                        userId, memberProfile.Id, bookId);
                    return Result<bool>.SuccessResult(true, "User has purchased this book");
                }
                else
                {
                    _logger.LogInformation("User {UserId} (member {MemberProfileId}) has NOT purchased book {BookId}",
                        userId, memberProfile.Id, bookId);
                    return Result<bool>.SuccessResult(false, "User has not purchased this book");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} has purchased book {BookId}", userId, bookId);
                return Result<bool>.FailureResult("Failed to check purchase status: " + ex.Message);
            }
        }
    }
}
