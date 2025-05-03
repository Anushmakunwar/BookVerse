using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.User
{
    public class UpdateUserDto
    {
        [EmailAddress]
        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [MinLength(6)]
        [JsonPropertyName("password")]
        public string? Password { get; set; }

        [Required]
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("role")]
        public string? Role { get; set; }
    }
}
