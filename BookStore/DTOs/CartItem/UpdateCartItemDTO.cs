using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.CartItem
{
    public class UpdateCartItemDTO
    {
        [Required]
        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100")]
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
    }
}
