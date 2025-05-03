using System.Text.Json.Serialization;

namespace BookStore.DTOs.User
{
    public class LoginResponseDto
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }


        [JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        // Override ToString for debugging
        public override string ToString()
        {
            return $"LoginResponseDto {{ Success={Success}, Message='{Message}', UserId={UserId}, Username='{Username}' }}";
        }
    }
}
