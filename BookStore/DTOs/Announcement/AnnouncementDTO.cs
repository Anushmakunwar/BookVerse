using System.Text.Json.Serialization;

namespace BookStore.DTOs.Announcement
{
    public class AnnouncementDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("startTime")]
        public DateTime StartTime { get; set; }

        [JsonPropertyName("endTime")]
        public DateTime EndTime { get; set; }

        [JsonPropertyName("createdBy")]
        public string CreatedBy { get; set; } = string.Empty;

        [JsonPropertyName("isActive")]
        public bool IsActive => DateTime.UtcNow >= StartTime && DateTime.UtcNow <= EndTime;
    }
}
