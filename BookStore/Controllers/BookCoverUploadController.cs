using BookStore.Repository.Book;
using BookStore.Services.FileUpload;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace BookStore.Controllers
{
    [Route("api/Books")]
    [ApiController]
    public class BookCoverUploadController : ControllerBase
    {
        private readonly IBookRepository _bookRepository;
        private readonly IFileUploadService _fileUploadService;
        private readonly ILogger<BookCoverUploadController> _logger;

        public BookCoverUploadController(
            IBookRepository bookRepository,
            IFileUploadService fileUploadService,
            ILogger<BookCoverUploadController> logger)
        {
            _bookRepository = bookRepository;
            _fileUploadService = fileUploadService;
            _logger = logger;
        }

        [HttpPost("{id}/cover")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadBookCover(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                // Check if the book exists
                var book = await _bookRepository.GetByIdAsync(id);
                if (book == null)
                {
                    return NotFound($"Book with ID {id} not found");
                }

                // Check if the file is an image
                if (!file.ContentType.StartsWith("image/"))
                {
                    return BadRequest("Only image files are allowed");
                }

                // Delete the old cover image if it exists
                if (!string.IsNullOrEmpty(book.CoverImage) && book.CoverImage.StartsWith("/uploads/"))
                {
                    await _fileUploadService.DeleteFileAsync(book.CoverImage);
                }

                // Upload the new cover image
                string coverImagePath = await _fileUploadService.UploadFileAsync(file, "covers");

                // Update the book with the new cover image path
                book.CoverImage = coverImagePath;
                await _bookRepository.UpdateAsync(book);

                return Ok(new { coverImagePath });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading book cover for book ID {BookId}", id);
                return StatusCode(500, "Error uploading book cover");
            }
        }

        [HttpDelete("{id}/cover")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBookCover(int id)
        {
            try
            {
                // Check if the book exists
                var book = await _bookRepository.GetByIdAsync(id);
                if (book == null)
                {
                    return NotFound($"Book with ID {id} not found");
                }

                // Check if the book has a cover image
                if (string.IsNullOrEmpty(book.CoverImage))
                {
                    return BadRequest("Book does not have a cover image");
                }

                // Delete the cover image if it's stored locally
                if (book.CoverImage.StartsWith("/uploads/"))
                {
                    bool deleted = await _fileUploadService.DeleteFileAsync(book.CoverImage);
                    if (!deleted)
                    {
                        _logger.LogWarning("Failed to delete cover image file: {FilePath}", book.CoverImage);
                    }
                }

                // Update the book to remove the cover image reference
                book.CoverImage = null;
                await _bookRepository.UpdateAsync(book);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book cover for book ID {BookId}", id);
                return StatusCode(500, "Error deleting book cover");
            }
        }
    }
}
