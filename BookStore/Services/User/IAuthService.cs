using BookStore.Core.Common;
using BookStore.DTOs.Auth;
using BookStore.DTOs.User;

namespace BookStore.Services.User;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterUserDTO dto);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
    Task<Result<bool>> ForgotPasswordAsync(ForgotPasswordRequestDTO dto);
    Task<Result<bool>> ResetPasswordWithOTPAsync(ResetPasswordWithOTPDTO dto);
}
