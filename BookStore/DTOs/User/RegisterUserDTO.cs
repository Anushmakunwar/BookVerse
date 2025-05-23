namespace BookStore.DTOs.User;

public class RegisterUserDTO
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";
}