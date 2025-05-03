namespace BookStore.DTOs.Book;

public class BookDto {
    public int Id { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public decimal Price { get; set; }
    public string? CoverImage { get; set; }
    public string Genre { get; set; }
    public string Language { get; set; }
    public string Format { get; set; }
    public string Publisher { get; set; }
    public bool IsAvailableInLibrary { get; set; }
    public int InventoryCount { get; set; }
    public int TotalSold { get; set; }
    public float AverageRating { get; set; }
    public DateTime PublishedDate { get; set; }
    public string ISBN { get; set; }
    public bool IsOnSale { get; set; }
    public decimal? DiscountPrice { get; set; }
}