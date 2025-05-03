using System.Text.Json.Serialization;

namespace BookStore.DTOs.Review
{
    public class ReviewDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("bookId")]
        public int BookId { get; set; }

        [JsonPropertyName("bookTitle")]
        public string BookTitle { get; set; } = string.Empty;

        [JsonPropertyName("memberName")]
        public string MemberName { get; set; } = string.Empty;

        [JsonPropertyName("rating")]
        public int Rating { get; set; }

        [JsonPropertyName("comment")]
        public string Comment { get; set; } = string.Empty;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
    }
}
