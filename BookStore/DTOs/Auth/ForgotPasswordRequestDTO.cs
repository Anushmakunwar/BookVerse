using System.ComponentModel.DataAnnotations;

namespace BookStore.DTOs.Auth
{
    public class ForgotPasswordRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
