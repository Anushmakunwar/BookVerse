using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookStore.DTOs.Announcement
{
    public class CreateAnnouncementDTO
    {
        [Required]
        [StringLength(500, ErrorMessage = "Message cannot exceed 500 characters")]
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("startTime")]
        public DateTime StartTime { get; set; }

        [Required]
        [JsonPropertyName("endTime")]
        public DateTime EndTime { get; set; }
    }
}
