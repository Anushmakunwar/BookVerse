using AutoMapper;
using BookStore.Core.Common;
using BookStore.Core.Repository;
using BookStore.DTOs.Book;
using BookStore.Entities;
using Microsoft.Extensions.Logging;

namespace BookStore.Services.Book;

/// <summary>
/// Service implementation for book operations
/// </summary>
public class BookService : IBookService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<BookService> _logger;

    public BookService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<BookService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of books
    /// </summary>
    public async Task<PaginatedResult<BookDto>> GetBooksAsync(int page, int size)
    {
        try
        {
            _logger.LogInformation("Getting books for page {Page} with size {Size}", page, size);

            var (books, totalCount) = await _unitOfWork.Books.GetPaginatedBooksAsync(page, size);
            var bookDtos = _mapper.Map<List<BookDto>>(books);

            _logger.LogInformation("Retrieved {Count} books for page {Page} with size {Size}", books.Count(), page, size);

            return PaginatedResult<BookDto>.SuccessResult(
                bookDtos,
                page,
                size,
                totalCount,
                "Books retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting books for page {Page} with size {Size}", page, size);
            return PaginatedResult<BookDto>.FailureResult("Failed to retrieve books: " + ex.Message);
        }
    }

    /// <summary>
    /// Gets a book by ID
    /// </summary>
    public async Task<Result<BookDetailDto>> GetBookDetailAsync(int id)
    {
        try
        {
            _logger.LogInformation("Getting book details for ID {Id}", id);

            var book = await _unitOfWork.Books.GetByIdAsync(id);
            if (book == null)
            {
                _logger.LogWarning("Book with ID {Id} not found", id);
                return Result<BookDetailDto>.FailureResult($"Book with ID {id} not found");
            }

            var bookDto = _mapper.Map<BookDetailDto>(book);
            return Result<BookDetailDto>.SuccessResult(bookDto, "Book details retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting book details for ID {Id}", id);
            return Result<BookDetailDto>.FailureResult("Failed to retrieve book details: " + ex.Message);
        }
    }

    /// <summary>
    /// Searches for books based on various criteria
    /// </summary>
    public async Task<Result<List<BookDto>>> SearchBooksAsync(
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
        try
        {
            _logger.LogInformation("Searching books with keyword {Keyword}", keyword ?? "none");

            var books = await _unitOfWork.Books.SearchAsync(
                keyword,
                sortBy,
                genre,
                minPrice,
                maxPrice,
                author,
                inStock,
                inLibrary,
                minRating,
                language,
                format,
                publisher,
                isbn);

            var bookDtos = _mapper.Map<List<BookDto>>(books);
            return Result<List<BookDto>>.SuccessResult(bookDtos, "Books search completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching books with keyword {Keyword}", keyword ?? "none");
            return Result<List<BookDto>>.FailureResult("Failed to search books: " + ex.Message);
        }
    }

    /// <summary>
    /// Adds a new book
    /// </summary>
    public async Task<Result<BookDto>> AddBookAsync(BookCreateDto bookDto)
    {
        try
        {
            _logger.LogInformation("Adding new book: {Title}", bookDto.Title);

            var book = _mapper.Map<Entities.Book>(bookDto);

            // Set default values
            book.CreatedAt = DateTime.UtcNow;
            book.updatedAt = DateTime.UtcNow;
            // PublishedDate is already set in the DTO with a default value
            book.AverageRating = 0;
            book.TotalSold = 0;

            // Add the book - this will also invalidate the cache in the repository
            var addedBook = await _unitOfWork.Books.AddAsync(book);

            // Verify the book was added by retrieving it
            var verifyBook = await _unitOfWork.Books.GetByIdAsync(addedBook.Id);
            if (verifyBook == null)
            {
                _logger.LogWarning("Book was not found after adding: {Title} with ID {Id}", bookDto.Title, addedBook.Id);
                // Try to add it again with a direct commit
                await _unitOfWork.CommitAsync();
                verifyBook = await _unitOfWork.Books.GetByIdAsync(addedBook.Id);
                if (verifyBook == null)
                {
                    _logger.LogError("Book still not found after second attempt: {Title}", bookDto.Title);
                    return Result<BookDto>.FailureResult("Book was added but could not be verified");
                }
            }

            var result = _mapper.Map<BookDto>(addedBook);

            _logger.LogInformation("Book added and verified successfully: {Title} with ID {Id}", bookDto.Title, addedBook.Id);

            return Result<BookDto>.SuccessResult(result, "Book added successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding new book: {Title}", bookDto.Title);
            return Result<BookDto>.FailureResult("Failed to add book: " + ex.Message);
        }
    }

    /// <summary>
    /// Updates an existing book
    /// </summary>
    public async Task<Result<BookDto>> UpdateBookAsync(int id, BookCreateDto bookDto)
    {
        try
        {
            _logger.LogInformation("Updating book with ID {Id}", id);

            // Check if book exists
            var existingBook = await _unitOfWork.Books.GetByIdAsync(id);
            if (existingBook == null)
            {
                _logger.LogWarning("Book with ID {Id} not found for update", id);
                return Result<BookDto>.FailureResult($"Book with ID {id} not found");
            }

            // Map DTO to entity
            var book = _mapper.Map<Entities.Book>(bookDto);
            book.Id = id;
            book.CreatedAt = existingBook.CreatedAt; // Preserve creation date
            book.updatedAt = DateTime.UtcNow;
            book.AverageRating = existingBook.AverageRating; // Preserve rating
            book.TotalSold = existingBook.TotalSold; // Preserve sales count

            // Update book
            var updatedBook = await _unitOfWork.Books.UpdateAsync(book);
            if (updatedBook == null)
            {
                _logger.LogWarning("Failed to update book with ID {Id}", id);
                return Result<BookDto>.FailureResult($"Failed to update book with ID {id}");
            }

            var result = _mapper.Map<BookDto>(updatedBook);
            return Result<BookDto>.SuccessResult(result, "Book updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating book with ID {Id}", id);
            return Result<BookDto>.FailureResult("Failed to update book: " + ex.Message);
        }
    }

    /// <summary>
    /// Deletes a book
    /// </summary>
    public async Task<Result> DeleteBookAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting book with ID {Id}", id);

            // Check if book exists
            var existingBook = await _unitOfWork.Books.GetByIdAsync(id);
            if (existingBook == null)
            {
                _logger.LogWarning("Book with ID {Id} not found for deletion", id);
                return Result.FailureResult($"Book with ID {id} not found");
            }

            // Delete book
            var result = await _unitOfWork.Books.RemoveByIdAsync(id);
            if (!result)
            {
                _logger.LogWarning("Failed to delete book with ID {Id}", id);
                return Result.FailureResult($"Failed to delete book with ID {id}");
            }

            return Result.SuccessResult("Book deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting book with ID {Id}", id);
            return Result.FailureResult("Failed to delete book: " + ex.Message);
        }
    }

    /// <summary>
    /// Gets book statistics for the admin dashboard
    /// </summary>
    public async Task<BookStatsDto> GetBookStatsAsync()
    {
        try
        {
            _logger.LogInformation("Getting book statistics for admin dashboard");

            // Get all books to calculate accurate statistics
            var (books, totalCount) = await _unitOfWork.Books.GetPaginatedBooksAsync(1, int.MaxValue);

            // Calculate total books in stock
            int totalInStock = books.Sum(b => b.InventoryCount);

            // Calculate total books sold
            int totalSold = books.Sum(b => b.TotalSold);

            // Get top 5 selling books
            var topSellingBooks = books
                .OrderByDescending(b => b.TotalSold)
                .Take(5)
                .Select(b => new TopSellingBookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    TotalSold = b.TotalSold
                })
                .ToList();

            return new BookStatsDto
            {
                TotalBooks = totalCount,
                TotalInStock = totalInStock,
                TotalSold = totalSold,
                TopSellingBooks = topSellingBooks
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting book statistics");
            // Return empty stats in case of error
            return new BookStatsDto
            {
                TotalBooks = 0,
                TotalInStock = 0,
                TotalSold = 0,
                TopSellingBooks = new List<TopSellingBookDto>()
            };
        }
    }

    /// <summary>
    /// Gets book statistics for the admin dashboard using a dedicated method
    /// </summary>
    public async Task<Result<BookStatsDto>> GetAdminDashboardStatsAsync()
    {
        try
        {
            _logger.LogInformation("Getting admin dashboard statistics using dedicated method");

            // Use the dedicated method to get all books without pagination
            var (books, totalCount) = await _unitOfWork.Books.GetAllBooksForStatsAsync();

            _logger.LogInformation("Retrieved {Count} books for admin dashboard statistics", books.Count());

            // Calculate total books in stock
            int totalInStock = books.Sum(b => b.InventoryCount);

            // Calculate total books sold
            int totalSold = books.Sum(b => b.TotalSold);

            // Get top 5 selling books
            var topSellingBooks = books
                .OrderByDescending(b => b.TotalSold)
                .Take(5)
                .Select(b => new TopSellingBookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    TotalSold = b.TotalSold
                })
                .ToList();

            var stats = new BookStatsDto
            {
                TotalBooks = totalCount,
                TotalInStock = totalInStock,
                TotalSold = totalSold,
                TopSellingBooks = topSellingBooks
            };

            return Result<BookStatsDto>.SuccessResult(stats, "Admin dashboard statistics retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting admin dashboard statistics");
            return Result<BookStatsDto>.FailureResult("Failed to retrieve admin dashboard statistics: " + ex.Message);
        }
    }
}
