using AutoMapper;
using BookStore.DTOs.User;
using BookStore.Entities;
using BookStore.Repository.User;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace BookStore.Services.User;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly IMapper _mapper;
    private readonly UserManager<Entities.User> _userManager;
    private readonly SignInManager<Entities.User> _signInManager;

    public AuthService(
        IUserRepository repo,
        IMapper mapper,
        UserManager<Entities.User> userManager,
        SignInManager<Entities.User> signInManager)
    {
        _repo = repo;
        _mapper = mapper;
        _userManager = userManager;
        _signInManager = signInManager;
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
        return userDto;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        Console.WriteLine($"AuthService: Looking up user with email {dto.Email}");
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            Console.WriteLine($"AuthService: User with email {dto.Email} not found");
            return new LoginResponseDto {
                Success = false,
                Message = "Invalid credentials"
            };
        }

        Console.WriteLine($"AuthService: User found, ID: {user.Id}, verifying password");
        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

        if (!result.Succeeded)
        {
            Console.WriteLine($"AuthService: Password verification failed for user {user.Id}");
            return new LoginResponseDto {
                Success = false,
                Message = "Invalid credentials"
            };
        }

        Console.WriteLine($"AuthService: Password verified for user {user.Id}");

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

        Console.WriteLine($"AuthService: Login response created, returning success=true");
        return response;
    }


}
