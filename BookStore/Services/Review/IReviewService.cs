using BookStore.Core.Common;
using BookStore.DTOs.Review;

namespace BookStore.Services.Review
{
    public interface IReviewService
    {
        Task<Result<List<ReviewDTO>>> GetReviewsByBookIdAsync(int bookId);
        Task<Result<List<ReviewDTO>>> GetReviewsByUserIdAsync(string userId);
        Task<Result<ReviewDTO>> GetReviewByIdAsync(int reviewId);
        Task<Result<ReviewDTO>> CreateReviewAsync(string userId, CreateReviewDTO createReviewDto);
        Task<Result<ReviewDTO>> UpdateReviewAsync(string userId, int reviewId, UpdateReviewDTO updateReviewDto);
        Task<Result<bool>> DeleteReviewAsync(string userId, int reviewId);
        Task<Result<bool>> HasUserPurchasedBookAsync(string userId, int bookId, bool bypassCache = false);
    }
}
