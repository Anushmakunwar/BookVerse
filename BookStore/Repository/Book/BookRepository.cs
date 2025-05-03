using System.Linq.Expressions;
using BookStore.Core.Extensions;
using BookStore.Core.Repository;
using BookStore.DatabaseContext;
using BookStore.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BookStore.Repository.Book;

/// <summary>
/// Repository implementation for Book entity operations
/// </summary>
public class BookRepository : Repository<Entities.Book>, IBookRepository
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<BookRepository> _logger;
    private const string BooksCacheKey = "Books_Cache_";

    public BookRepository(
        BookStoreDBContext context,
        IMemoryCache cache,
        ILogger<BookRepository> logger) : base(context)
    {
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of books - no caching for simplicity
    /// </summary>
    public async Task<(IEnumerable<Entities.Book> Books, int TotalCount)> GetPaginatedBooksAsync(int page, int size)
    {
        _logger.LogInformation("Getting books directly from database for page {Page} with size {Size}", page, size);

        // Get directly from database without caching
        var totalCount = await DbSet.CountAsync();
        var books = await DbSet
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return (books, totalCount);
    }

    /// <summary>
    /// Searches for books based on various criteria with optimized query building
    /// </summary>
    public async Task<IEnumerable<Entities.Book>> SearchAsync(
        string? keyword,
        string? sortBy,
        string? genre,
        decimal? minPrice,
        decimal? maxPrice,
        string? author = null,
        bool? inStock = null,
        bool? inLibrary = null,
        float? minRating = null,
        string? language = null,
        string? format = null,
        string? publisher = null,
        string? isbn = null)
    {
        // Start with a clean query
        var query = Query();

        // Build a combined filter for better performance when possible
        var filters = new List<Expression<Func<Entities.Book, bool>>>();

        // Search by keyword in title, author, description, or ISBN
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            filters.Add(b => b.Title.Contains(keyword) ||
                           b.Author.Contains(keyword) ||
                           b.Description.Contains(keyword) ||
                           b.ISBN.Contains(keyword));
        }

        // Filter by specific author
        if (!string.IsNullOrWhiteSpace(author))
        {
            filters.Add(b => b.Author.Contains(author));
        }

        // Filter by genre
        if (!string.IsNullOrWhiteSpace(genre))
        {
            filters.Add(b => b.Genre.Contains(genre));
        }

        // Filter by price range
        if (minPrice.HasValue)
        {
            filters.Add(b => b.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            filters.Add(b => b.Price <= maxPrice.Value);
        }

        // Filter by availability in stock
        if (inStock.HasValue)
        {
            filters.Add(b => inStock.Value ? b.InventoryCount > 0 : b.InventoryCount == 0);
        }

        // Filter by availability in library
        if (inLibrary.HasValue)
        {
            filters.Add(b => b.IsAvailableInLibrary == inLibrary.Value);
        }

        // Filter by minimum rating
        if (minRating.HasValue)
        {
            filters.Add(b => b.AverageRating >= minRating.Value);
        }

        // Filter by language
        if (!string.IsNullOrWhiteSpace(language))
        {
            filters.Add(b => b.Language.Contains(language));
        }

        // Filter by format
        if (!string.IsNullOrWhiteSpace(format))
        {
            filters.Add(b => b.Format.Contains(format));
        }

        // Filter by publisher
        if (!string.IsNullOrWhiteSpace(publisher))
        {
            filters.Add(b => b.Publisher.Contains(publisher));
        }

        // Filter by ISBN
        if (!string.IsNullOrWhiteSpace(isbn))
        {
            filters.Add(b => b.ISBN.Contains(isbn));
        }

        // Apply all filters
        foreach (var filter in filters)
        {
            query = query.Where(filter);
        }

        // Apply sorting
        query = ApplySorting(query, sortBy);

        // Execute the query and return results
        return await query.ToListAsync();
    }

    /// <summary>
    /// Applies sorting to a book query based on the sortBy parameter
    /// </summary>
    private IQueryable<Entities.Book> ApplySorting(IQueryable<Entities.Book> query, string? sortBy)
    {
        return sortBy?.ToLower() switch
        {
            "price" => query.OrderBy(b => b.Price),
            "price_desc" => query.OrderByDescending(b => b.Price),
            "title" => query.OrderBy(b => b.Title),
            "title_desc" => query.OrderByDescending(b => b.Title),
            "date" => query.OrderBy(b => b.PublishedDate),
            "date_desc" => query.OrderByDescending(b => b.PublishedDate),
            "popularity" => query.OrderByDescending(b => b.TotalSold),
            "rating" => query.OrderByDescending(b => b.AverageRating),
            "newest" => query.OrderByDescending(b => b.CreatedAt),
            "oldest" => query.OrderBy(b => b.CreatedAt),
            _ => query.OrderByDescending(b => b.CreatedAt) // Default to newest
        };
    }

    /// <summary>
    /// Adds a new book and invalidates cache
    /// </summary>
    public override async Task<Entities.Book> AddAsync(Entities.Book book)
    {
        _logger.LogInformation("Adding new book: {Title}", book.Title);

        // Set timestamps
        book.CreatedAt = DateTime.UtcNow;
        book.updatedAt = DateTime.UtcNow;

        try
        {
            // Add the book directly to the DbSet
            DbSet.Add(book);

            // Save changes immediately
            await Context.SaveChangesAsync();

            _logger.LogInformation("Book added successfully with ID: {Id}", book.Id);

            // Invalidate cache to ensure fresh data is returned on next query
            InvalidateCache();

            return book;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding book: {Title}", book.Title);
            throw;
        }
    }

    /// <summary>
    /// Updates an existing book and invalidates cache
    /// </summary>
    public override async Task<Entities.Book?> UpdateAsync(Entities.Book book)
    {
        book.updatedAt = DateTime.UtcNow;

        var result = await base.UpdateAsync(book);
        InvalidateCache();
        return result;
    }

    /// <summary>
    /// Removes a book by ID and invalidates cache
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        var result = await RemoveByIdAsync(id);
        InvalidateCache();
        return result;
    }

    /// <summary>
    /// Gets all books for admin statistics without pagination
    /// </summary>
    public async Task<(IEnumerable<Entities.Book> Books, int TotalCount)> GetAllBooksForStatsAsync()
    {
        _logger.LogInformation("Getting all books for admin statistics without pagination");

        try
        {
            // Get total count
            var totalCount = await DbSet.CountAsync();
            _logger.LogInformation("Total book count: {TotalCount}", totalCount);

            // Get all books directly without pagination
            var books = await DbSet.ToListAsync();

            _logger.LogInformation("Retrieved {Count} books for admin statistics", books.Count);

            // Log some sample data to verify
            if (books.Any())
            {
                var firstBook = books.First();
                _logger.LogInformation("Sample book data - ID: {Id}, Title: {Title}, InventoryCount: {InventoryCount}, TotalSold: {TotalSold}",
                    firstBook.Id, firstBook.Title, firstBook.InventoryCount, firstBook.TotalSold);
            }
            else
            {
                _logger.LogWarning("No books found in the database");
            }

            return (books, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all books for admin statistics");
            return (new List<Entities.Book>(), 0);
        }
    }

    /// <summary>
    /// Invalidates all book-related cache entries - simplified since we're not using caching
    /// </summary>
    private void InvalidateCache()
    {
        // We're not using caching anymore, but keeping this method for compatibility
        _logger.LogInformation("Cache invalidation called (no-op since caching is disabled)");
    }
}
