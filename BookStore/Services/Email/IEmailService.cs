namespace BookStore.Services.Email
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(string email, string fullName, string claimCode, string orderDetails);
        Task SendOrderProcessedAsync(string email, string fullName, string claimCode, string orderDetails);
        Task SendOrderCancellationAsync(string email, string fullName, string claimCode, string orderDetails);
        Task SendPasswordResetAsync(string email, string fullName, string resetLink);
        Task SendWelcomeEmailAsync(string email, string fullName);
        Task SendOTPEmailAsync(string email, string fullName, string otp, DateTime expiresAt);
    }
}
