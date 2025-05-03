using BookStore.Core.Repository;
using BookStore.Entities;

namespace BookStore.Repository.Book;

/// <summary>
/// Repository interface for Book entity operations
/// </summary>
public interface IBookRepository : IRepository<Entities.Book>
{
    /// <summary>
    /// Searches for books based on various criteria
    /// </summary>
    Task<IEnumerable<Entities.Book>> SearchAsync(
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
        string? isbn = null
    );

    /// <summary>
    /// Gets a paginated list of books with caching
    /// </summary>
    Task<(IEnumerable<Entities.Book> Books, int TotalCount)> GetPaginatedBooksAsync(int page, int size);

    /// <summary>
    /// Gets all books for admin statistics without pagination
    /// </summary>
    Task<(IEnumerable<Entities.Book> Books, int TotalCount)> GetAllBooksForStatsAsync();
}
