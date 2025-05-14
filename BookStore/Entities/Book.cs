using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Entities;

public class Book
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Author { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string ISBN { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Required, Range(0, 10000)]
    public decimal Price { get; set; }

    public int InventoryCount { get; set; }

    public bool isOnSale { get; set; }

    public string Genre { get; set; } = string.Empty;

    public string Language { get; set; } = "English";

    public string Format { get; set; } = "Paperback";

    public string Publisher { get; set; } = string.Empty;

    public bool IsAvailableInLibrary { get; set; } = true;

    public int TotalSold { get; set; } = 0;

    public float AverageRating { get; set; } = 0;

    [MaxLength(255)]
    public string? CoverImage { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountdPrice { get; set; }

    public DateTime PublishedDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime updatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Review> Reviews { get; set; }
}