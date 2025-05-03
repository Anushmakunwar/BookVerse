using BookStore.Core.Common;
using BookStore.DTOs.User;
using BookStore.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookStore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<UserController> _logger;

        public UserController(
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<UserController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userManager.Users.ToListAsync();
                var userDtos = new List<UserManagementDto>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    var role = roles.FirstOrDefault() ?? "Member";

                    userDtos.Add(new UserManagementDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FullName = user.FullName,
                        Role = role
                    });
                }

                return Ok(new { success = true, users = userDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "Member";

                var userDto = new UserManagementDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = role
                };

                return Ok(new { success = true, user = userDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID {UserId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                // Check if email is already in use
                var existingUser = await _userManager.FindByEmailAsync(createUserDto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { success = false, message = "Email is already in use" });
                }

                // Validate role
                if (!await _roleManager.RoleExistsAsync(createUserDto.Role))
                {
                    return BadRequest(new { success = false, message = "Invalid role" });
                }

                // Create user
                var user = new User
                {
                    UserName = createUserDto.Email,
                    Email = createUserDto.Email,
                    EmailConfirmed = true,
                    FullName = createUserDto.FullName
                };

                var result = await _userManager.CreateAsync(user, createUserDto.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return BadRequest(new { success = false, message = $"Failed to create user: {errors}" });
                }

                // Add user to role
                await _userManager.AddToRoleAsync(user, createUserDto.Role);

                // Create member profile if user is a Member
                if (createUserDto.Role == "Member")
                {
                    // Member profile will be created by the DbSeeder on next startup
                }

                var userDto = new UserManagementDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = createUserDto.Role
                };

                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new { success = true, user = userDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Update user properties
                user.FullName = updateUserDto.FullName;
                
                // Update email if changed
                if (!string.IsNullOrEmpty(updateUserDto.Email) && user.Email != updateUserDto.Email)
                {
                    // Check if new email is already in use
                    var existingUser = await _userManager.FindByEmailAsync(updateUserDto.Email);
                    if (existingUser != null && existingUser.Id != id)
                    {
                        return BadRequest(new { success = false, message = "Email is already in use" });
                    }

                    user.Email = updateUserDto.Email;
                    user.UserName = updateUserDto.Email;
                    user.NormalizedEmail = updateUserDto.Email.ToUpper();
                    user.NormalizedUserName = updateUserDto.Email.ToUpper();
                }

                // Update user
                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                    return BadRequest(new { success = false, message = $"Failed to update user: {errors}" });
                }

                // Update password if provided
                if (!string.IsNullOrEmpty(updateUserDto.Password))
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var resetResult = await _userManager.ResetPasswordAsync(user, token, updateUserDto.Password);
                    
                    if (!resetResult.Succeeded)
                    {
                        var errors = string.Join(", ", resetResult.Errors.Select(e => e.Description));
                        return BadRequest(new { success = false, message = $"Failed to update password: {errors}" });
                    }
                }

                // Update role if changed
                if (!string.IsNullOrEmpty(updateUserDto.Role))
                {
                    // Validate role
                    if (!await _roleManager.RoleExistsAsync(updateUserDto.Role))
                    {
                        return BadRequest(new { success = false, message = "Invalid role" });
                    }

                    // Get current roles
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    
                    // Remove from current roles
                    if (currentRoles.Any())
                    {
                        await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    }
                    
                    // Add to new role
                    await _userManager.AddToRoleAsync(user, updateUserDto.Role);
                }

                // Get updated user with role
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "Member";

                var userDto = new UserManagementDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = role
                };

                return Ok(new { success = true, user = userDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Don't allow deleting the current user
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (id == currentUserId)
                {
                    return BadRequest(new { success = false, message = "You cannot delete your own account" });
                }

                // Delete user
                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return BadRequest(new { success = false, message = $"Failed to delete user: {errors}" });
                }

                return Ok(new { success = true, message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }
    }
}
