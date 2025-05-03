using BookStore.Repository.Announcement;
using BookStore.Repository.Book;
using BookStore.Repository.BookMark;
using BookStore.Repository.CartItem;
using BookStore.Repository.Order;
using BookStore.Repository.Review;
using BookStore.Repository.User;

namespace BookStore.Core.Repository;

/// <summary>
/// Unit of Work interface that manages all repositories and provides a single point for database operations
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Book repository
    /// </summary>
    IBookRepository Books { get; }

    /// <summary>
    /// User repository
    /// </summary>
    IUserRepository Users { get; }

    /// <summary>
    /// Bookmark repository
    /// </summary>
    IBookMarkRepository Bookmarks { get; }

    /// <summary>
    /// Cart item repository
    /// </summary>
    ICartItemRepository CartItems { get; }

    /// <summary>
    /// Order repository
    /// </summary>
    IOrderRepository Orders { get; }

    /// <summary>
    /// Review repository
    /// </summary>
    IReviewRepository Reviews { get; }

    /// <summary>
    /// Announcement repository
    /// </summary>
    IAnnouncementRepository Announcements { get; }

    /// <summary>
    /// Commits all changes to the database
    /// </summary>
    Task<int> CommitAsync();

    /// <summary>
    /// Rolls back all changes
    /// </summary>
    void Rollback();
}
