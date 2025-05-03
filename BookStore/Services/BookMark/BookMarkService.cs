using BookStore.DTOs.BookMark;
using BookStore.Repository.BookMark;

namespace BookStore.Services.BookMark;

public class BookmarkService : IBookMarkService
{
    private readonly IBookMarkRepository _bookmarkRepository;

    public BookmarkService(IBookMarkRepository bookmarkRepository)
    {
        _bookmarkRepository = bookmarkRepository;
    }

    public Task AddBookmarkAsync(int userId, int bookId)
        => _bookmarkRepository.AddBookmarkAsync(userId, bookId);

    public Task<IEnumerable<BookMarkDTO>> GetBookmarksAsync(int userId)
        => _bookmarkRepository.GetBookmarksAsync(userId);

    public Task RemoveBookmarkAsync(int userId, int bookId)
        => _bookmarkRepository.RemoveBookmarkAsync(userId, bookId);

    public Task<Entities.Bookmark?> GetBookmarkByIdAsync(int bookmarkId)
        => _bookmarkRepository.GetBookmarkByIdAsync(bookmarkId);

    public Task DeleteBookmarkAsync(int bookmarkId)
        => _bookmarkRepository.DeleteBookmarkAsync(bookmarkId);
}
