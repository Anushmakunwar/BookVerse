using BookStore.Core.Common;

namespace BookStore.Services.OTP
{
    public interface IOTPService
    {
        /// <summary>
        /// Generates a new OTP for the specified email address
        /// </summary>
        /// <param name="email">The email address to generate an OTP for</param>
        /// <returns>Result indicating success or failure</returns>
        Task<Result<string>> GenerateOTPAsync(string email);
        
        /// <summary>
        /// Validates an OTP for the specified email address
        /// </summary>
        /// <param name="email">The email address to validate the OTP for</param>
        /// <param name="otp">The OTP to validate</param>
        /// <returns>Result indicating success or failure</returns>
        Task<Result<bool>> ValidateOTPAsync(string email, string otp);
        
        /// <summary>
        /// Marks an OTP as used
        /// </summary>
        /// <param name="email">The email address associated with the OTP</param>
        /// <param name="otp">The OTP to mark as used</param>
        /// <returns>Result indicating success or failure</returns>
        Task<Result<bool>> MarkOTPAsUsedAsync(string email, string otp);
    }
}
