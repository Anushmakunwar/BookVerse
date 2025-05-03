using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.CartItem
{
    public class AddToCartDTO
    {
        [Required]
        [JsonPropertyName("bookId")]
        public int BookId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100")]
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; } = 1;
    }
}
