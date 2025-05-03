using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Repository.Review
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly BookStoreDBContext _context;
        private readonly ILogger<ReviewRepository> _logger;

        public ReviewRepository(BookStoreDBContext context, ILogger<ReviewRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Entities.Review>> GetReviewsByBookIdAsync(int bookId)
        {
            try
            {
                return await _context.Reviews
                    .Include(r => r.MemberProfile)
                    .ThenInclude(mp => mp.User)
                    .Where(r => r.BookId == bookId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for book {BookId}", bookId);
                throw;
            }
        }

        public async Task<IEnumerable<Entities.Review>> GetReviewsByMemberIdAsync(int memberProfileId)
        {
            try
            {
                return await _context.Reviews
                    .Include(r => r.Book)
                    .Where(r => r.MemberProfileId == memberProfileId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for member {MemberProfileId}", memberProfileId);
                throw;
            }
        }

        public async Task<Entities.Review?> GetReviewByIdAsync(int reviewId)
        {
            try
            {
                return await _context.Reviews
                    .Include(r => r.Book)
                    .Include(r => r.MemberProfile)
                    .ThenInclude(mp => mp.User)
                    .FirstOrDefaultAsync(r => r.Id == reviewId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review with ID {ReviewId}", reviewId);
                throw;
            }
        }

        public async Task<Entities.Review?> GetReviewByBookAndMemberAsync(int bookId, int memberProfileId)
        {
            try
            {
                return await _context.Reviews
                    .FirstOrDefaultAsync(r => r.BookId == bookId && r.MemberProfileId == memberProfileId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review for book {BookId} and member {MemberProfileId}", bookId, memberProfileId);
                throw;
            }
        }

        public async Task<Entities.Review> AddReviewAsync(Entities.Review review)
        {
            try
            {
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Update book average rating
                await UpdateBookAverageRatingAsync(review.BookId);

                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding review for book {BookId} by member {MemberProfileId}", review.BookId, review.MemberProfileId);
                throw;
            }
        }

        public async Task<Entities.Review> UpdateReviewAsync(Entities.Review review)
        {
            try
            {
                _context.Reviews.Update(review);
                await _context.SaveChangesAsync();

                // Update book average rating
                await UpdateBookAverageRatingAsync(review.BookId);

                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review with ID {ReviewId}", review.Id);
                throw;
            }
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(reviewId);
                if (review == null)
                {
                    return false;
                }

                int bookId = review.BookId;
                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();

                // Update book average rating
                await UpdateBookAverageRatingAsync(bookId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review with ID {ReviewId}", reviewId);
                throw;
            }
        }

        public async Task<bool> HasMemberPurchasedBookAsync(int memberProfileId, int bookId)
        {
            try
            {
                _logger.LogInformation("Checking if member {MemberProfileId} has purchased book {BookId}", memberProfileId, bookId);

                // First, check if the member exists
                var memberExists = await _context.MemberProfiles.AnyAsync(mp => mp.Id == memberProfileId);
                if (!memberExists)
                {
                    _logger.LogWarning("Member with ID {MemberProfileId} not found", memberProfileId);
                    return false;
                }

                // Then check if the book exists
                var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId);
                if (!bookExists)
                {
                    _logger.LogWarning("Book with ID {BookId} not found", bookId);
                    return false;
                }

                // Get all processed orders for this member
                var processedOrders = await _context.Orders
                    .Where(o => o.MemberProfileId == memberProfileId && o.IsProcessed && !o.IsCancelled)
                    .ToListAsync();

                _logger.LogInformation("Found {OrderCount} processed orders for member {MemberProfileId}",
                    processedOrders.Count, memberProfileId);

                // If no processed orders, return false
                if (!processedOrders.Any())
                {
                    return false;
                }

                // Get all order IDs
                var orderIds = processedOrders.Select(o => o.Id).ToList();

                // Check if any of these orders contain the book
                var hasPurchased = await _context.OrderItems
                    .AnyAsync(oi => orderIds.Contains(oi.OrderId) && oi.BookId == bookId);

                _logger.LogInformation("Member {MemberProfileId} has{NotStr} purchased book {BookId}",
                    memberProfileId, hasPurchased ? "" : " not", bookId);

                return hasPurchased;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if member {MemberProfileId} has purchased book {BookId}", memberProfileId, bookId);
                throw;
            }
        }

        public async Task<float> CalculateAverageRatingForBookAsync(int bookId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.BookId == bookId)
                    .ToListAsync();

                if (!reviews.Any())
                {
                    return 0;
                }

                return (float)reviews.Average(r => r.Rating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating average rating for book {BookId}", bookId);
                throw;
            }
        }

        private async Task UpdateBookAverageRatingAsync(int bookId)
        {
            try
            {
                var book = await _context.Books.FindAsync(bookId);
                if (book != null)
                {
                    book.AverageRating = await CalculateAverageRatingForBookAsync(bookId);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating average rating for book {BookId}", bookId);
                throw;
            }
        }
    }
}
