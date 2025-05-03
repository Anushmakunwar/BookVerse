using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.User
{
    public class CreateUserDto
    {
        [Required]
        [EmailAddress]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("role")]
        public string Role { get; set; } = "Member";
    }
}
