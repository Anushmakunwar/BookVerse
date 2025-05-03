using BookStore.Entities;

namespace BookStore.Repository.Review
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Entities.Review>> GetReviewsByBookIdAsync(int bookId);
        Task<IEnumerable<Entities.Review>> GetReviewsByMemberIdAsync(int memberProfileId);
        Task<Entities.Review?> GetReviewByIdAsync(int reviewId);
        Task<Entities.Review?> GetReviewByBookAndMemberAsync(int bookId, int memberProfileId);
        Task<Entities.Review> AddReviewAsync(Entities.Review review);
        Task<Entities.Review> UpdateReviewAsync(Entities.Review review);
        Task<bool> DeleteReviewAsync(int reviewId);
        Task<bool> HasMemberPurchasedBookAsync(int memberProfileId, int bookId);
        Task<float> CalculateAverageRatingForBookAsync(int bookId);
    }
}
