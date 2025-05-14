using BookStore.Core.Common;
using BookStore.DatabaseContext;
using BookStore.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Services.OTP
{
    public class OTPService : IOTPService
    {
        private readonly BookStoreDBContext _context;
        private readonly UserManager<Entities.User> _userManager;
        private readonly IEmailService _emailService;
        private readonly ILogger<OTPService> _logger;
        private readonly Random _random = new Random();

        public OTPService(
            BookStoreDBContext context,
            UserManager<Entities.User> userManager,
            IEmailService emailService,
            ILogger<OTPService> logger)
        {
            _context = context;
            _userManager = userManager;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<Result<string>> GenerateOTPAsync(string email)
        {
            try
            {
                // Find the user by email
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return Result<string>.FailureResult("User not found");
                }

                // Generate a 6-digit OTP
                string otp = GenerateRandomOTP();

                // Set expiration time to 5 minutes from now
                var expiresAt = DateTime.UtcNow.AddMinutes(5);

                // Invalidate any existing OTPs for this user
                var existingOTPs = await _context.OTPs
                    .Where(o => o.UserId == user.Id && !o.IsUsed)
                    .ToListAsync();

                foreach (var existingOTP in existingOTPs)
                {
                    existingOTP.IsUsed = true;
                }

                // Create a new OTP record
                var otpEntity = new Entities.OTP
                {
                    Code = otp,
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt,
                    IsUsed = false
                };

                _context.OTPs.Add(otpEntity);
                await _context.SaveChangesAsync();

                // Send OTP via email
                await SendOTPEmailAsync(user.Email, user.FullName, otp, expiresAt);

                return Result<string>.SuccessResult(otp, "OTP generated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating OTP for {Email}", email);
                return Result<string>.FailureResult("Failed to generate OTP: " + ex.Message);
            }
        }

        public async Task<Result<bool>> ValidateOTPAsync(string email, string otp)
        {
            try
            {
                // Find the user by email
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return Result<bool>.FailureResult("User not found");
                }

                // Find the OTP record
                var otpEntity = await _context.OTPs
                    .Where(o => o.UserId == user.Id && o.Code == otp && !o.IsUsed)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otpEntity == null)
                {
                    return Result<bool>.FailureResult("Invalid OTP");
                }

                // Check if OTP is expired
                if (otpEntity.ExpiresAt < DateTime.UtcNow)
                {
                    return Result<bool>.FailureResult("OTP has expired");
                }

                return Result<bool>.SuccessResult(true, "OTP is valid");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating OTP for {Email}", email);
                return Result<bool>.FailureResult("Failed to validate OTP: " + ex.Message);
            }
        }

        public async Task<Result<bool>> MarkOTPAsUsedAsync(string email, string otp)
        {
            try
            {
                // Find the user by email
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return Result<bool>.FailureResult("User not found");
                }

                // Find the OTP record
                var otpEntity = await _context.OTPs
                    .Where(o => o.UserId == user.Id && o.Code == otp && !o.IsUsed)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otpEntity == null)
                {
                    return Result<bool>.FailureResult("Invalid OTP");
                }

                // Mark OTP as used
                otpEntity.IsUsed = true;
                await _context.SaveChangesAsync();

                return Result<bool>.SuccessResult(true, "OTP marked as used");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking OTP as used for {Email}", email);
                return Result<bool>.FailureResult("Failed to mark OTP as used: " + ex.Message);
            }
        }

        private string GenerateRandomOTP()
        {
            // Generate a random 6-digit number
            int otpNumber = _random.Next(100000, 999999);
            return otpNumber.ToString();
        }

        private async Task SendOTPEmailAsync(string email, string fullName, string otp, DateTime expiresAt)
        {
            try
            {
                await _emailService.SendOTPEmailAsync(email, fullName, otp, expiresAt);
                _logger.LogInformation("OTP email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP email to {Email}", email);
                // Don't rethrow the exception, similar to how order confirmation emails are handled
                // This allows the OTP generation to succeed even if email sending fails
            }
        }
    }
}
