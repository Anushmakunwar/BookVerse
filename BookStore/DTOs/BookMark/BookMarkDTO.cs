namespace BookStore.DTOs.BookMark;

public class BookMarkDTO
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public decimal BookPrice { get; set; }
    public string BookCoverImage { get; set; } = string.Empty;
    public string BookDescription { get; set; } = string.Empty;
    public string BookGenre { get; set; } = string.Empty;
    public string BookLanguage { get; set; } = string.Empty;
    public string BookFormat { get; set; } = string.Empty;
    public string BookPublisher { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}