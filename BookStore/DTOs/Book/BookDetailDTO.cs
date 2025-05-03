namespace BookStore.DTOs.Book;

public class BookDetailDto : BookDto {
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int QuantityAvailable { get; set; }
}