namespace BookStore.Services.Notification
{
    public interface INotificationService
    {
        Task BroadcastOrderNotificationAsync(string memberName, string bookTitle);
        Task BroadcastAnnouncementAsync(string message);
    }
}
