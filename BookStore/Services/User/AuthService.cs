using AutoMapper;
using BookStore.Core.Common;
using BookStore.DTOs.Auth;
using BookStore.DTOs.User;
using BookStore.Entities;
using BookStore.Repository.User;
using BookStore.Services.Email;
using BookStore.Services.OTP;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace BookStore.Services.User;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly IMapper _mapper;
    private readonly UserManager<Entities.User> _userManager;
    private readonly SignInManager<Entities.User> _signInManager;
    private readonly IEmailService _emailService;
    private readonly IOTPService _otpService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository repo,
        IMapper mapper,
        UserManager<Entities.User> userManager,
        SignInManager<Entities.User> signInManager,
        IEmailService emailService,
        IOTPService otpService,
        ILogger<AuthService> logger)
    {
        _repo = repo;
        _mapper = mapper;
        _userManager = userManager;
        _signInManager = signInManager;
        _emailService = emailService;
        _otpService = otpService;
        _logger = logger;
    }

    public async Task<UserDto> RegisterAsync(RegisterUserDTO dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
            throw new Exception("Email already registered.");

        var user = new Entities.User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Failed to create user: {errors}");
        }

        // Add user to Member role
        await _userManager.AddToRoleAsync(user, "Member");

        // Create member profile directly in the database context
        var memberProfile = new MemberProfile
        {
            UserId = user.Id,
            Address = dto.Address,
            PhoneNumber = dto.Phone,
            JoinedAt = DateTime.UtcNow,
            TotalOrders = 0
        };

        try
        {
            // Save the member profile
            await _repo.CreateMemberProfileAsync(memberProfile);
        }
        catch (Exception ex)
        {
            // If creating the member profile fails, log the error but don't fail the registration
            Console.WriteLine($"Error creating member profile: {ex.Message}");
            // The DbSeeder will create a member profile for this user on next startup
        }

        // Create UserDto manually instead of using AutoMapper
        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = "Member"
        };

        // Send welcome email
        try
        {
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName);
            _logger.LogInformation("Welcome email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            // Log the error but don't fail the registration
            _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
        }

        return userDto;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        _logger.LogInformation("Looking up user with email {Email}", dto.Email);
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            _logger.LogWarning("User with email {Email} not found", dto.Email);
            return new LoginResponseDto {
                Success = false,
                Message = "Invalid credentials"
            };
        }

        _logger.LogInformation("User found, ID: {UserId}, verifying password", user.Id);
        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

        if (!result.Succeeded)
        {
            _logger.LogWarning("Password verification failed for user {UserId}", user.Id);
            return new LoginResponseDto {
                Success = false,
                Message = "Invalid credentials"
            };
        }

        _logger.LogInformation("Password verified for user {UserId}", user.Id);

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Member";

        var response = new LoginResponseDto
        {
            Success = true,
            UserId = user.Id,
            Username = user.FullName,
            Message = "Login successful"
        };

        _logger.LogInformation("Login response created for user {UserId}, returning success=true", user.Id);
        return response;
    }

    public async Task<Result<bool>> ForgotPasswordAsync(ForgotPasswordRequestDTO dto)
    {
        try
        {
            _logger.LogInformation("Processing forgot password request for email {Email}", dto.Email);

            // Find the user by email
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                _logger.LogWarning("User with email {Email} not found for forgot password request", dto.Email);
                // Return success even if user not found to prevent email enumeration attacks
                return Result<bool>.SuccessResult(true, "If your email is registered, you will receive an OTP shortly");
            }

            // Generate OTP
            var otpResult = await _otpService.GenerateOTPAsync(dto.Email);
            if (!otpResult.Success)
            {
                _logger.LogError("Failed to generate OTP for user {UserId}: {Message}", user.Id, otpResult.Message);
                return Result<bool>.FailureResult("Failed to generate OTP: " + otpResult.Message);
            }

            _logger.LogInformation("OTP generated successfully for user {UserId}", user.Id);
            return Result<bool>.SuccessResult(true, "If your email is registered, you will receive an OTP shortly");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing forgot password request for {Email}", dto.Email);
            return Result<bool>.FailureResult("An error occurred while processing your request");
        }
    }

    public async Task<Result<bool>> ResetPasswordWithOTPAsync(ResetPasswordWithOTPDTO dto)
    {
        try
        {
            _logger.LogInformation("Processing reset password with OTP request for email {Email}", dto.Email);

            // Find the user by email
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                _logger.LogWarning("User with email {Email} not found for reset password request", dto.Email);
                return Result<bool>.FailureResult("Invalid email or OTP");
            }

            // Validate OTP
            var validateResult = await _otpService.ValidateOTPAsync(dto.Email, dto.OTP);
            if (!validateResult.Success)
            {
                _logger.LogWarning("Invalid OTP for user {UserId}: {Message}", user.Id, validateResult.Message);
                return Result<bool>.FailureResult(validateResult.Message);
            }

            // Mark OTP as used
            var markResult = await _otpService.MarkOTPAsUsedAsync(dto.Email, dto.OTP);
            if (!markResult.Success)
            {
                _logger.LogError("Failed to mark OTP as used for user {UserId}: {Message}", user.Id, markResult.Message);
                // Continue with password reset even if marking OTP as used fails
            }

            // Reset password
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

            if (!resetResult.Succeeded)
            {
                var errors = string.Join(", ", resetResult.Errors.Select(e => e.Description));
                _logger.LogError("Failed to reset password for user {UserId}: {Errors}", user.Id, errors);
                return Result<bool>.FailureResult("Failed to reset password: " + errors);
            }

            _logger.LogInformation("Password reset successful for user {UserId}", user.Id);
            return Result<bool>.SuccessResult(true, "Password reset successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing reset password with OTP request for {Email}", dto.Email);
            return Result<bool>.FailureResult("An error occurred while processing your request");
        }
    }
}
