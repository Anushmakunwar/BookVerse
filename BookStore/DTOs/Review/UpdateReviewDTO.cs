using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.Review
{
    public class UpdateReviewDTO
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        [JsonPropertyName("rating")]
        public int Rating { get; set; }

        [Required]
        [StringLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters")]
        [JsonPropertyName("comment")]
        public string Comment { get; set; } = string.Empty;
    }
}
