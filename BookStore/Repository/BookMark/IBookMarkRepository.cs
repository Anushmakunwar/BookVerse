using BookStore.DTOs.BookMark;

namespace BookStore.Repository.BookMark;

public interface IBookMarkRepository
{
    Task AddBookmarkAsync(int userId, int bookId);
    Task<IEnumerable<BookMarkDTO>> GetBookmarksAsync(int userId);
    Task RemoveBookmarkAsync(int userId, int bookId);
    Task<BookStore.Entities.Bookmark?> GetBookmarkByIdAsync(int bookmarkId);
    Task DeleteBookmarkAsync(int bookmarkId);
}