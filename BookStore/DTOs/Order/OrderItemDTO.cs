using System.Text.Json.Serialization;

namespace BookStore.DTOs.Order
{
    public class OrderItemDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("bookId")]
        public int BookId { get; set; }

        [JsonPropertyName("bookTitle")]
        public string BookTitle { get; set; } = string.Empty;

        [JsonPropertyName("bookAuthor")]
        public string BookAuthor { get; set; } = string.Empty;

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("totalPrice")]
        public decimal TotalPrice => Price * Quantity;

        [JsonPropertyName("coverImage")]
        public string? CoverImage { get; set; }
    }
}
