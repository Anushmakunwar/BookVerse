using BookStore.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace BookStore.Services.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task BroadcastOrderNotificationAsync(string memberName, string bookTitle)
        {
            try
            {
                var message = $"{memberName} just purchased {bookTitle}!";
                await _hubContext.Clients.All.SendAsync("ReceiveOrderNotification", new
                {
                    message = message,
                    timestamp = DateTime.UtcNow,
                    type = "order"
                });
                _logger.LogInformation("Order notification broadcasted: {Message}", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error broadcasting order notification");
            }
        }

        public async Task BroadcastAnnouncementAsync(string message)
        {
            try
            {
                await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", new
                {
                    message = message,
                    timestamp = DateTime.UtcNow,
                    type = "announcement"
                });
                _logger.LogInformation("Announcement broadcasted: {Message}", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error broadcasting announcement");
            }
        }
    }
}
