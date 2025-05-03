using System.Text.Json.Serialization;

namespace BookStore.DTOs.Order
{
    public class OrderDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("orderDate")]
        public DateTime OrderDate { get; set; }

        [JsonPropertyName("totalAmount")]
        public decimal TotalAmount { get; set; }

        [JsonPropertyName("subtotal")]
        public decimal Subtotal { get; set; }

        [JsonPropertyName("discountPercentage")]
        public decimal DiscountPercentage { get; set; }

        [JsonPropertyName("discountDescription")]
        public string DiscountDescription { get; set; } = string.Empty;

        [JsonPropertyName("claimCode")]
        public string ClaimCode { get; set; } = string.Empty;

        [JsonPropertyName("isProcessed")]
        public bool IsProcessed { get; set; }

        [JsonPropertyName("isCancelled")]
        public bool IsCancelled { get; set; }

        [JsonPropertyName("items")]
        public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
    }
}
