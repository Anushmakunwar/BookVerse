using System.Net;
using System.Net.Mail;

namespace BookStore.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Get email settings from configuration
            _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.example.com";
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            _smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? "user@example.com";
            _smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? "password";
            _fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@bookstore.com";
            _fromName = _configuration["EmailSettings:FromName"] ?? "BookStore";
        }

        public async Task SendOrderConfirmationAsync(string email, string fullName, string claimCode, string orderDetails)
        {
            try
            {
                var subject = "Your BookStore Order Confirmation";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4a69bd; color: white; padding: 10px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .claim-code {{ font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background-color: #f1f2f6; border-radius: 5px; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Order Confirmation</h1>
                            </div>
                            <div class='content'>
                                <p>Dear {fullName},</p>
                                <p>Thank you for your order from BookStore. Your order has been received and is being processed.</p>
                                <p>Please use the following claim code when you visit our store to pick up your order:</p>
                                <div class='claim-code'>{claimCode}</div>
                                <h2>Order Details</h2>
                                {orderDetails}
                                <p>If you have any questions about your order, please contact our customer service.</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                await SendEmailAsync(email, subject, body);
                _logger.LogInformation("Order confirmation email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending order confirmation email to {Email}", email);
            }
        }

        public async Task SendPasswordResetAsync(string email, string fullName, string resetLink)
        {
            try
            {
                var subject = "Reset Your BookStore Password";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4a69bd; color: white; padding: 10px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .button {{ display: inline-block; padding: 10px 20px; background-color: #4a69bd; color: white; text-decoration: none; border-radius: 5px; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Password Reset</h1>
                            </div>
                            <div class='content'>
                                <p>Dear {fullName},</p>
                                <p>We received a request to reset your password for your BookStore account. Click the button below to reset your password:</p>
                                <p style='text-align: center;'>
                                    <a href='{resetLink}' class='button'>Reset Password</a>
                                </p>
                                <p>If you did not request a password reset, please ignore this email or contact our customer service if you have concerns.</p>
                                <p>This link will expire in 24 hours.</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                await SendEmailAsync(email, subject, body);
                _logger.LogInformation("Password reset email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending password reset email to {Email}", email);
            }
        }

        public async Task SendWelcomeEmailAsync(string email, string fullName)
        {
            try
            {
                var subject = "Welcome to BookStore!";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4a69bd; color: white; padding: 10px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Welcome to BookStore!</h1>
                            </div>
                            <div class='content'>
                                <p>Dear {fullName},</p>
                                <p>Thank you for joining BookStore! We're excited to have you as a member.</p>
                                <p>With your new account, you can:</p>
                                <ul>
                                    <li>Browse our extensive catalog of books</li>
                                    <li>Save your favorite books to your wishlist</li>
                                    <li>Place orders for in-store pickup</li>
                                    <li>Write reviews for books you've purchased</li>
                                </ul>
                                <p>If you have any questions or need assistance, please don't hesitate to contact our customer service team.</p>
                                <p>Happy reading!</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                await SendEmailAsync(email, subject, body);
                _logger.LogInformation("Welcome email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending welcome email to {Email}", email);
            }
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                // Create the email message
                var mail = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mail.To.Add(new MailAddress(to));

                // Create the SMTP client
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                    EnableSsl = true
                };

                // Send the email
                await client.SendMailAsync(mail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {Email}", to);
                throw;
            }
        }
    }
}
