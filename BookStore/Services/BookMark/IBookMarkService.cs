using BookStore.DTOs.BookMark;

namespace BookStore.Services.BookMark;

public interface IBookMarkService
{
    Task AddBookmarkAsync(int userId, int bookId);
    Task<IEnumerable<BookMarkDTO>> GetBookmarksAsync(int userId);
    Task RemoveBookmarkAsync(int userId, int bookId);
    Task<Entities.Bookmark?> GetBookmarkByIdAsync(int bookmarkId);
    Task DeleteBookmarkAsync(int bookmarkId);
}