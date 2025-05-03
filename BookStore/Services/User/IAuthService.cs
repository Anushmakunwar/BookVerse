using BookStore.DTOs.User;

namespace BookStore.Services.User;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterUserDTO dto);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto); // Changed to match DTOs
}
