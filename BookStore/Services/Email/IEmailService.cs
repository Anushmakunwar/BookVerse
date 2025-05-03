namespace BookStore.Services.Email
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(string email, string fullName, string claimCode, string orderDetails);
        Task SendPasswordResetAsync(string email, string fullName, string resetLink);
        Task SendWelcomeEmailAsync(string email, string fullName);
    }
}
