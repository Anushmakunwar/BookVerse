using BookStore.DTOs.Auth;
using BookStore.DTOs.User;
using BookStore.Entities;
using BookStore.Services.User;
using BookStore.DatabaseContext;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookStore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly BookStoreDBContext _context;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            BookStoreDBContext context)
        {
            _authService = authService;
            _logger = logger;
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDTO model)
        {
            try
            {
                _logger.LogInformation("Register attempt for email: {Email}", model.Email);

                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                var result = await _authService.RegisterAsync(model);

                _logger.LogInformation("Registration successful for user: {UserId}", result.Id);

                // Return success response with user details
                return Ok(new { success = true, user = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in register: {Message}", ex.Message);

                // Return error response
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", model.Email);

                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                // Get the user from the database
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    _logger.LogWarning("Login failed: User not found for email {Email}", model.Email);
                    return BadRequest(new { success = false, message = "Invalid email or password" });
                }

                // Check password
                var passwordValid = await _userManager.CheckPasswordAsync(user, model.Password);
                if (!passwordValid)
                {
                    _logger.LogWarning("Login failed: Invalid password for user {Email}", model.Email);
                    return BadRequest(new { success = false, message = "Invalid email or password" });
                }

                // Get user roles
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "Member";

                // Create claims for the user
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, role)
                };

                // Sign in the user with cookie authentication
                await _signInManager.SignInWithClaimsAsync(user, model.RememberMe, claims);

                _logger.LogInformation("Login successful for user {UserId}", user.Id);

                // Get member profile to get totalOrders
                var memberProfile = await _context.MemberProfiles
                    .FirstOrDefaultAsync(mp => mp.UserId == user.Id);

                int totalOrders = memberProfile?.TotalOrders ?? 0;

                // Return success response
                return Ok(new {
                    success = true,
                    message = "Login successful",
                    userId = user.Id,
                    username = user.FullName,
                    email = user.Email,
                    role = role,
                    totalOrders = totalOrders
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in login: {Message}", ex.Message);

                // Return error response
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                // Get user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "User ID not found in claims" });
                }

                // Get user from database
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Get user roles
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "Member";

                // Get member profile to get totalOrders
                var memberProfile = await _context.MemberProfiles
                    .FirstOrDefaultAsync(mp => mp.UserId == user.Id);

                int totalOrders = memberProfile?.TotalOrders ?? 0;

                // Return user information
                return Ok(new {
                    success = true,
                    user = new {
                        id = user.Id,
                        email = user.Email,
                        username = user.FullName,
                        role = role,
                        totalOrders = totalOrders
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in GetCurrentUser: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // Sign out the user
                await _signInManager.SignOutAsync();

                _logger.LogInformation("User logged out successfully");

                // Clear the cookie
                Response.Cookies.Delete(".AspNetCore.Identity.Application");

                return Ok(new { success = true, message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in Logout: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("access-denied")]
        public IActionResult AccessDenied()
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { success = false, message = "Access denied. You do not have permission to access this resource." });
        }

        [HttpGet("test-forgot-password")]
        public IActionResult TestForgotPassword()
        {
            return Ok(new { success = true, message = "Forgot password endpoint is working" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO model)
        {
            try
            {
                // Log the entire request for debugging
                _logger.LogInformation("Forgot password request received: {@Model}", model);

                // Validate model
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state: {@ModelState}", ModelState);
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                if (model == null)
                {
                    _logger.LogWarning("Model is null");
                    return BadRequest(new { success = false, message = "Request body is required" });
                }

                if (string.IsNullOrEmpty(model.Email))
                {
                    _logger.LogWarning("Email is null or empty");
                    return BadRequest(new { success = false, message = "Email is required" });
                }

                _logger.LogInformation("Forgot password request for email: {Email}", model.Email);

                var result = await _authService.ForgotPasswordAsync(model);

                if (!result.Success)
                {
                    _logger.LogWarning("Forgot password failed: {Message}", result.Message);
                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("Forgot password request processed for email: {Email}", model.Email);

                // Always return success to prevent email enumeration attacks
                return Ok(new { success = true, message = "If your email is registered, you will receive an OTP shortly" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in forgot password: {Message}", ex.Message);

                // Return error response
                return BadRequest(new { success = false, message = "An error occurred while processing your request: " + ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordWithOTPDTO model)
        {
            try
            {
                _logger.LogInformation("Reset password request for email: {Email}", model.Email);

                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                var result = await _authService.ResetPasswordWithOTPAsync(model);

                if (!result.Success)
                {
                    _logger.LogWarning("Reset password failed: {Message}", result.Message);
                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("Password reset successful for email: {Email}", model.Email);

                return Ok(new { success = true, message = "Password reset successful" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in reset password: {Message}", ex.Message);

                // Return error response
                return BadRequest(new { success = false, message = "An error occurred while processing your request" });
            }
        }
    }
}
