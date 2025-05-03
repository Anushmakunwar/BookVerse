using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.Order
{
    public class ProcessOrderDTO
    {
        [Required]
        [JsonPropertyName("claimCode")]
        public string ClaimCode { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("membershipId")]
        public string MembershipId { get; set; } = string.Empty;
    }
}
