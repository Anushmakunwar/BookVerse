using BookStore.Repository.Book;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http;

namespace BookStore.Controllers
{
    [Route("api/Books")]
    [ApiController]
    public class BookCoverController : ControllerBase
    {
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<BookCoverController> _logger;
        private readonly HttpClient _httpClient;

        public BookCoverController(IBookRepository bookRepository, ILogger<BookCoverController> logger)
        {
            _bookRepository = bookRepository;
            _logger = logger;
            _httpClient = new HttpClient();
        }

        [HttpGet("{id}/cover")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookCover(int id)
        {
            try
            {
                var book = await _bookRepository.GetByIdAsync(id);
                if (book == null)
                {
                    return NotFound();
                }

                if (string.IsNullOrEmpty(book.CoverImage))
                {
                    // Return a default image or placeholder
                    return Redirect("https://picsum.photos/200/300");
                }

                // If the cover image is a URL, redirect to it
                if (Uri.TryCreate(book.CoverImage, UriKind.Absolute, out var uri))
                {
                    return Redirect(book.CoverImage);
                }

                // If it's a local file path, try to serve it
                // This assumes the image is stored in a location accessible to the application
                if (System.IO.File.Exists(book.CoverImage))
                {
                    var fileBytes = await System.IO.File.ReadAllBytesAsync(book.CoverImage);
                    return File(fileBytes, "image/jpeg"); // Adjust content type as needed
                }

                // If we can't determine what the cover image is, return a placeholder
                return Redirect("https://picsum.photos/200/300");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving book cover for book ID {BookId}", id);
                return StatusCode(500, "Error retrieving book cover");
            }
        }
    }
}
