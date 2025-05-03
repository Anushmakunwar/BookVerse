using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.Order
{
    public class CreateOrderDTO
    {
        [JsonPropertyName("note")]
        public string? Note { get; set; }
    }
}
