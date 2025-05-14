using System.ComponentModel.DataAnnotations;

namespace BookStore.DTOs.Auth
{
    public class ResetPasswordWithOTPDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 characters")]
        public string OTP { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        public string NewPassword { get; set; } = string.Empty;
        
        [Required]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
