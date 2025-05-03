using BookStore.DatabaseContext;
using BookStore.Repository.Announcement;
using BookStore.Repository.Book;
using BookStore.Repository.BookMark;
using BookStore.Repository.CartItem;
using BookStore.Repository.Order;
using BookStore.Repository.Review;
using BookStore.Repository.User;
using Microsoft.EntityFrameworkCore.Storage;

namespace BookStore.Core.Repository;

/// <summary>
/// Unit of Work implementation that manages all repositories and provides a single point for database operations
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly BookStoreDBContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    public IBookRepository Books { get; }
    public IUserRepository Users { get; }
    public IBookMarkRepository Bookmarks { get; }
    public ICartItemRepository CartItems { get; }
    public IOrderRepository Orders { get; }
    public IReviewRepository Reviews { get; }
    public IAnnouncementRepository Announcements { get; }

    public UnitOfWork(
        BookStoreDBContext context,
        IBookRepository bookRepository,
        IUserRepository userRepository,
        IBookMarkRepository bookmarkRepository,
        ICartItemRepository cartItemRepository,
        IOrderRepository orderRepository,
        IReviewRepository reviewRepository,
        IAnnouncementRepository announcementRepository)
    {
        _context = context;
        Books = bookRepository;
        Users = userRepository;
        Bookmarks = bookmarkRepository;
        CartItems = cartItemRepository;
        Orders = orderRepository;
        Reviews = reviewRepository;
        Announcements = announcementRepository;
    }

    public async Task<int> CommitAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Rollback()
    {
        _transaction?.Rollback();
        _transaction?.Dispose();
        _transaction = null;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _context.Dispose();
            _transaction?.Dispose();
        }
        _disposed = true;
    }
}
