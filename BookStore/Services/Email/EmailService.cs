using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Hosting;

namespace BookStore.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly IHostEnvironment _environment;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly bool _useFileLogger;
        private readonly string _fileLogPath;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHostEnvironment environment)
        {
            _configuration = configuration;
            _logger = logger;
            _environment = environment;

            // Get email settings from configuration
            _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.example.com";
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            _smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? "user@example.com";
            _smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? "password";
            _fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@bookstore.com";
            _fromName = _configuration["EmailSettings:FromName"] ?? "BookStore";

            // Development-specific settings
            _useFileLogger = _environment.IsDevelopment() &&
                             bool.TryParse(_configuration["EmailSettings:UseFileLogger"], out bool useFileLogger) &&
                             useFileLogger;
            _fileLogPath = _configuration["EmailSettings:FileLogPath"] ?? "email_logs";

            // Ensure the email log directory exists if using file logger
            if (_useFileLogger && !Directory.Exists(_fileLogPath))
            {
                Directory.CreateDirectory(_fileLogPath);
                _logger.LogInformation("Created email log directory at {Path}", _fileLogPath);
            }
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

        public async Task SendOrderProcessedAsync(string email, string fullName, string claimCode, string orderDetails)
        {
            try
            {
                var subject = "Your BookStore Order is Ready for Pickup";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4a69bd; color: white; padding: 10px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .claim-code {{ font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background-color: #e8f5e9; border-radius: 5px; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
                            .ready-notice {{ background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Order Ready for Pickup</h1>
                            </div>
                            <div class='content'>
                                <div class='ready-notice'>
                                    <h2 style='margin-top: 0; color: #2e7d32;'>Good News!</h2>
                                    <p>Your order has been processed and is now ready for pickup at our store.</p>
                                </div>

                                <p>Dear {fullName},</p>
                                <p>Thank you for your order from BookStore. We're pleased to inform you that your order has been processed and is now ready for pickup.</p>
                                <p>Please remember to bring the following claim code when you visit our store:</p>
                                <div class='claim-code'>{claimCode}</div>
                                <h2>Order Details</h2>
                                {orderDetails}
                                <p>If you have any questions about your order, please contact our customer service.</p>
                                <p>We look forward to seeing you soon!</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                await SendEmailAsync(email, subject, body);
                _logger.LogInformation("Order processed email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending order processed email to {Email}", email);
                throw;
            }
        }

        public async Task SendOrderCancellationAsync(string email, string fullName, string claimCode, string orderDetails)
        {
            try
            {
                var subject = "Your BookStore Order Has Been Cancelled";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #c62828; color: white; padding: 10px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .claim-code {{ font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background-color: #ffebee; border-radius: 5px; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
                            .cancel-notice {{ background-color: #ffebee; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Order Cancelled</h1>
                            </div>
                            <div class='content'>
                                <div class='cancel-notice'>
                                    <h2 style='margin-top: 0; color: #c62828;'>Order Cancellation Notice</h2>
                                    <p>Your order has been cancelled as requested.</p>
                                </div>

                                <p>Dear {fullName},</p>
                                <p>We're confirming that your order with claim code <strong>{claimCode}</strong> has been cancelled.</p>
                                <p>All items have been returned to inventory, and no charges have been applied to your account.</p>
                                <h2>Cancelled Order Details</h2>
                                {orderDetails}
                                <p>If you did not request this cancellation or have any questions, please contact our customer service immediately.</p>
                                <p>We hope to see you again soon!</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                await SendEmailAsync(email, subject, body);
                _logger.LogInformation("Order cancellation email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending order cancellation email to {Email}", email);
                throw;
            }
        }

        public async Task SendOTPEmailAsync(string email, string fullName, string otp, DateTime expiresAt)
        {
            try
            {
                var subject = "Your BookStore Password Reset OTP";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4a69bd; color: white; padding: 10px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .otp-code {{ font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background-color: #f1f2f6; border-radius: 5px; letter-spacing: 5px; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
                            .expiry-notice {{ background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                            .security-notice {{ font-size: 12px; background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Password Reset OTP</h1>
                            </div>
                            <div class='content'>
                                <p>Dear {fullName},</p>
                                <p>We received a request to reset your password for your BookStore account. Please use the following One-Time Password (OTP) to complete your password reset:</p>

                                <div class='otp-code'>{otp}</div>

                                <div class='expiry-notice'>
                                    <p><strong>Important:</strong> This OTP will expire in 5 minutes at {expiresAt.ToLocalTime():hh:mm tt} on {expiresAt.ToLocalTime():MMMM dd, yyyy}.</p>
                                </div>

                                <p>If you did not request a password reset, please ignore this email or contact our customer service if you have concerns about your account security.</p>

                                <div class='security-notice'>
                                    <p>For security reasons, never share this OTP with anyone. Our customer service representatives will never ask for your OTP.</p>
                                </div>
                            </div>
                            <div class='footer'>
                                <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                await SendEmailAsync(email, subject, body);
                _logger.LogInformation("OTP email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP email to {Email}", email);
                // Don't rethrow the exception, similar to how order confirmation emails are handled
            }
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                _logger.LogInformation("Preparing to send email to {Email} with subject: {Subject}", to, subject);

                // Create the email message
                var mail = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mail.To.Add(new MailAddress(to));

                _logger.LogInformation("Email message created with From: {From}, To: {To}", mail.From, string.Join(", ", mail.To.Select(t => t.Address)));

                // If in development and file logger is enabled, save the email to a file instead of sending it
                if (_useFileLogger)
                {
                    await SaveEmailToFileAsync(mail);
                    _logger.LogInformation("Email saved to file instead of sending (development mode)");
                    return;
                }

                // In production or if file logger is disabled, send the email via SMTP
                _logger.LogInformation("Using SMTP server: {Server}:{Port}, Username: {Username}", _smtpServer, _smtpPort, _smtpUsername);

                // Create the SMTP client
                _logger.LogInformation("Creating SMTP client with server {Server}:{Port}", _smtpServer, _smtpPort);
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Timeout = 30000 // 30 seconds timeout
                };

                _logger.LogInformation("SMTP client created, attempting to send email...");

                // Send the email
                await client.SendMailAsync(mail);
                _logger.LogInformation("Email successfully sent to {Email}", to);
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "SMTP error sending email to {Email}: {StatusCode} - {Message}",
                    to, smtpEx.StatusCode, smtpEx.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {Email}: {Message}", to, ex.Message);
                throw;
            }
        }

        private async Task SaveEmailToFileAsync(MailMessage mail)
        {
            try
            {
                // Create a unique filename based on timestamp and recipient
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var recipient = mail.To.First().Address.Replace("@", "_at_").Replace(".", "_");
                var filename = Path.Combine(_fileLogPath, $"{timestamp}_{recipient}.html");

                // Create the email content with metadata and body
                var sb = new StringBuilder();
                sb.AppendLine("<!DOCTYPE html>");
                sb.AppendLine("<html>");
                sb.AppendLine("<head>");
                sb.AppendLine("  <meta charset=\"UTF-8\">");
                sb.AppendLine("  <title>Email Log</title>");
                sb.AppendLine("  <style>");
                sb.AppendLine("    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }");
                sb.AppendLine("    .metadata { background-color: #f0f0f0; padding: 15px; margin-bottom: 20px; border-radius: 5px; }");
                sb.AppendLine("    .metadata h2 { margin-top: 0; }");
                sb.AppendLine("    .metadata table { width: 100%; border-collapse: collapse; }");
                sb.AppendLine("    .metadata td { padding: 5px; }");
                sb.AppendLine("    .metadata td:first-child { font-weight: bold; width: 100px; }");
                sb.AppendLine("    .email-body { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }");
                sb.AppendLine("  </style>");
                sb.AppendLine("</head>");
                sb.AppendLine("<body>");

                // Add metadata section
                sb.AppendLine("  <div class=\"metadata\">");
                sb.AppendLine("    <h2>Email Metadata</h2>");
                sb.AppendLine("    <table>");
                sb.AppendLine($"      <tr><td>From:</td><td>{mail.From}</td></tr>");
                sb.AppendLine($"      <tr><td>To:</td><td>{string.Join(", ", mail.To.Select(t => t.Address))}</td></tr>");
                sb.AppendLine($"      <tr><td>Subject:</td><td>{mail.Subject}</td></tr>");
                sb.AppendLine($"      <tr><td>Date:</td><td>{DateTime.Now}</td></tr>");
                sb.AppendLine("    </table>");
                sb.AppendLine("  </div>");

                // Add email body
                sb.AppendLine("  <div class=\"email-body\">");
                sb.AppendLine(mail.Body);
                sb.AppendLine("  </div>");

                sb.AppendLine("</body>");
                sb.AppendLine("</html>");

                // Write to file
                await File.WriteAllTextAsync(filename, sb.ToString());
                _logger.LogInformation("Email saved to file: {Filename}", filename);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving email to file");
            }
        }
    }
}
