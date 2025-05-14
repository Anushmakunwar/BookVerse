using BookStore.DatabaseContext;
using BookStore.DTOs.BookMark;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Repository.BookMark;
using BookStore.Entities;

public class BookmarkRepository : IBookMarkRepository
{
    private readonly BookStoreDBContext _context;

    public BookmarkRepository(BookStoreDBContext context)
    {
        _context = context;
    }

    public async Task<Bookmark?> GetBookmarkByIdAsync(int bookmarkId)
    {
        try
        {
            // Use raw SQL to get bookmark data including CreatedAt
            var sql = @"SELECT b.""Id"" as Id, b.""BookId"" as BookId, b.""MemberProfileId"" as MemberProfileId, b.""CreatedAt"" as CreatedAt
                       FROM ""Bookmarks"" b
                       WHERE b.""Id"" = @bookmarkId";

            Bookmark? bookmark = null;

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = sql;
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@bookmarkId", bookmarkId));

                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();

                using (var result = await command.ExecuteReaderAsync())
                {
                    if (await result.ReadAsync())
                    {
                        bookmark = new Bookmark
                        {
                            Id = result.GetInt32(0),
                            BookId = result.GetInt32(1),
                            MemberProfileId = result.GetInt32(2),
                            CreatedAt = !result.IsDBNull(3) ? result.GetDateTime(3) : (DateTime?)null
                        };
                    }
                }
            }

            // If bookmark exists, load the related entities
            if (bookmark != null)
            {
                bookmark.Book = await _context.Books.FindAsync(bookmark.BookId);
                bookmark.MemberProfile = await _context.MemberProfiles.FindAsync(bookmark.MemberProfileId);
            }

            return bookmark;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting bookmark by ID: {ex.Message}");
            return null;
        }
    }

    public async Task DeleteBookmarkAsync(int bookmarkId)
    {
        try
        {
            Console.WriteLine($"Attempting to delete bookmark with ID: {bookmarkId}");

            // First try using Entity Framework
            var bookmark = await _context.Bookmarks.FindAsync(bookmarkId);
            if (bookmark != null)
            {
                Console.WriteLine($"Found bookmark with ID {bookmarkId} using EF, deleting...");
                _context.Bookmarks.Remove(bookmark);
                var efResult = await _context.SaveChangesAsync();
                Console.WriteLine($"EF deletion result: {efResult} rows affected");
                return;
            }

            Console.WriteLine($"Bookmark with ID {bookmarkId} not found using EF, trying raw SQL...");

            // If EF approach fails, use raw SQL as a fallback
            var sql = @"DELETE FROM ""Bookmarks"" WHERE ""Id"" = @bookmarkId";

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = sql;
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@bookmarkId", bookmarkId));

                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();

                var sqlResult = await command.ExecuteNonQueryAsync();
                Console.WriteLine($"SQL deletion result: {sqlResult} rows affected");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting bookmark: {ex.Message}");
            throw; // Re-throw to let the controller handle it
        }
    }

    public async Task AddBookmarkAsync(int userId, int bookId)
    {
        try
        {
            // Check if the bookmark already exists using raw SQL
            var checkSql = @"SELECT COUNT(*) FROM ""Bookmarks""
                           WHERE ""MemberProfileId"" = @userId AND ""BookId"" = @bookId";

            int existingCount = 0;

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = checkSql;
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@userId", userId));
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@bookId", bookId));

                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();

                existingCount = Convert.ToInt32(await command.ExecuteScalarAsync());
            }

            if (existingCount > 0)
            {
                // Bookmark already exists, no need to add it again
                return;
            }

            // Create SQL command to insert bookmark with CreatedAt
            var insertSql = "INSERT INTO \"Bookmarks\" (\"MemberProfileId\", \"BookId\", \"CreatedAt\") VALUES (@userId, @bookId, @createdAt)";

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = insertSql;
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@userId", userId));
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@bookId", bookId));
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@createdAt", DateTime.UtcNow));

                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();

                await command.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            // Log the error
            Console.WriteLine($"Error adding bookmark: {ex.Message}");
            throw; // Re-throw to let the controller handle it
        }
    }

    public async Task<IEnumerable<BookMarkDTO>> GetBookmarksAsync(int userId)
    {
        try {
            // Use Entity Framework to get full book details
            var bookmarks = await _context.Bookmarks
                .Where(b => b.MemberProfileId == userId)
                .Join(
                    _context.Books,
                    bookmark => bookmark.BookId,
                    book => book.Id,
                    (bookmark, book) => new BookMarkDTO
                    {
                        Id = bookmark.Id,
                        BookId = bookmark.BookId,
                        BookTitle = book.Title,
                        BookAuthor = book.Author,
                        BookPrice = book.Price,
                        BookCoverImage = book.CoverImage,
                        BookDescription = book.Description,
                        BookGenre = book.Genre,
                        BookLanguage = book.Language,
                        BookFormat = book.Format,
                        BookPublisher = book.Publisher,
                        CreatedAt = bookmark.CreatedAt ?? DateTime.UtcNow // Use actual CreatedAt if available
                    }
                )
                .ToListAsync();

            return bookmarks;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting bookmarks: {ex.Message}");

            // Fallback to raw SQL if Entity Framework approach fails
            var sql = @"SELECT b.""Id"" as Id, b.""BookId"" as BookId,
                       bk.""Title"" as BookTitle, bk.""Author"" as BookAuthor, bk.""Price"" as BookPrice,
                       bk.""CoverImage"" as BookCoverImage, bk.""Description"" as BookDescription,
                       bk.""Genre"" as BookGenre, bk.""Language"" as BookLanguage,
                       bk.""Format"" as BookFormat, bk.""Publisher"" as BookPublisher,
                       b.""CreatedAt"" as CreatedAt
                       FROM ""Bookmarks"" b
                       INNER JOIN ""Books"" bk ON b.""BookId"" = bk.""Id""
                       WHERE b.""MemberProfileId"" = @userId";

            var bookmarks = new List<BookMarkDTO>();

            try {
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = sql;
                    command.Parameters.Add(new Npgsql.NpgsqlParameter("@userId", userId));

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                        await command.Connection.OpenAsync();

                    using (var result = await command.ExecuteReaderAsync())
                    {
                        while (await result.ReadAsync())
                        {
                            bookmarks.Add(new BookMarkDTO
                            {
                                Id = result.GetInt32(0),
                                BookId = result.GetInt32(1),
                                BookTitle = !result.IsDBNull(2) ? result.GetString(2) : string.Empty,
                                BookAuthor = !result.IsDBNull(3) ? result.GetString(3) : string.Empty,
                                BookPrice = !result.IsDBNull(4) ? result.GetDecimal(4) : 0,
                                BookCoverImage = !result.IsDBNull(5) ? result.GetString(5) : string.Empty,
                                BookDescription = !result.IsDBNull(6) ? result.GetString(6) : string.Empty,
                                BookGenre = !result.IsDBNull(7) ? result.GetString(7) : string.Empty,
                                BookLanguage = !result.IsDBNull(8) ? result.GetString(8) : string.Empty,
                                BookFormat = !result.IsDBNull(9) ? result.GetString(9) : string.Empty,
                                BookPublisher = !result.IsDBNull(10) ? result.GetString(10) : string.Empty,
                                CreatedAt = !result.IsDBNull(11) ? result.GetDateTime(11) : DateTime.UtcNow // Use actual CreatedAt if available
                            });
                        }
                    }
                }

                return bookmarks;
            }
            catch (Exception innerEx)
            {
                Console.WriteLine($"Error in fallback SQL for bookmarks: {innerEx.Message}");
                return new List<BookMarkDTO>();
            }
        }
    }

    public async Task RemoveBookmarkAsync(int userId, int bookId)
    {
        try
        {
            // Use raw SQL to delete the bookmark
            var sql = @"DELETE FROM ""Bookmarks""
                      WHERE ""MemberProfileId"" = @userId AND ""BookId"" = @bookId";

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = sql;
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@userId", userId));
                command.Parameters.Add(new Npgsql.NpgsqlParameter("@bookId", bookId));

                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();

                await command.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error removing bookmark: {ex.Message}");
            throw; // Re-throw to let the controller handle it
        }
    }
}
