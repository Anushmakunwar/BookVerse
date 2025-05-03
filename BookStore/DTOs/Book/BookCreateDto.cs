using System.ComponentModel.DataAnnotations;

namespace BookStore.DTOs.Book
{
    public class BookCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Author { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 10000)]
        public decimal Price { get; set; }

        [Required]
        [Range(0, 10000)]
        public int InventoryCount { get; set; }

        public bool IsOnSale { get; set; } = false;

        [Required]
        [StringLength(50)]
        public string Genre { get; set; } = string.Empty;

        public string? CoverImage { get; set; }

        public decimal? DiscountPrice { get; set; }

        [Required]
        [StringLength(20)]
        public string ISBN { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Language { get; set; } = "English";

        [Required]
        [StringLength(50)]
        public string Format { get; set; } = "Paperback";

        [Required]
        [StringLength(100)]
        public string Publisher { get; set; } = string.Empty;

        public bool IsAvailableInLibrary { get; set; } = true;

        public float AverageRating { get; set; } = 0;

        public DateTime PublishedDate { get; set; } = DateTime.UtcNow;
    }
}
