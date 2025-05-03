using BookStore.Entities;
using BookStore.DatabaseContext;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Data
{
    public class DbSeeder
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<DbSeeder> _logger;
        private readonly BookStoreDBContext _context;

        public DbSeeder(
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<DbSeeder> logger,
            BookStoreDBContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _context = context;
        }

        public async Task SeedAsync()
        {
            try
            {
                await SeedRolesAsync();
                await SeedAdminUserAsync();
                await SeedStaffUsersAsync();
                await SeedMemberProfilesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database.");
            }
        }

        private async Task SeedRolesAsync()
        {
            // Create roles if they don't exist
            string[] roleNames = { "Admin", "Member", "Staff" };

            foreach (var roleName in roleNames)
            {
                var roleExists = await _roleManager.RoleExistsAsync(roleName);
                if (!roleExists)
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                    _logger.LogInformation($"Created role: {roleName}");
                }
            }
        }

        private async Task SeedAdminUserAsync()
        {
            // Create admin user if it doesn't exist
            var adminEmail = "admin@gmail.com";
            var adminUser = await _userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FullName = "Admin User"
                };

                var result = await _userManager.CreateAsync(adminUser, "password");

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, "Admin");
                    _logger.LogInformation($"Created admin user: {adminEmail}");
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError($"Failed to create admin user. Errors: {errors}");
                }
            }
            else
            {
                // Ensure the user is in the Admin role
                if (!await _userManager.IsInRoleAsync(adminUser, "Admin"))
                {
                    await _userManager.AddToRoleAsync(adminUser, "Admin");
                    _logger.LogInformation($"Added existing user {adminEmail} to Admin role");
                }
            }
        }

        private async Task SeedStaffUsersAsync()
        {
            // Create staff users if they don't exist
            var staffUsers = new List<(string Email, string FullName)>
            {
                ("staff1@gmail.com", "Staff User One"),
                ("staff2@gmail.com", "Staff User Two")
            };

            foreach (var (email, fullName) in staffUsers)
            {
                var staffUser = await _userManager.FindByEmailAsync(email);

                if (staffUser == null)
                {
                    staffUser = new User
                    {
                        UserName = email,
                        Email = email,
                        EmailConfirmed = true,
                        FullName = fullName
                    };

                    var result = await _userManager.CreateAsync(staffUser, "password");

                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(staffUser, "Staff");
                        _logger.LogInformation($"Created staff user: {email}");
                    }
                    else
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        _logger.LogError($"Failed to create staff user {email}. Errors: {errors}");
                    }
                }
                else
                {
                    // Ensure the user is in the Staff role
                    if (!await _userManager.IsInRoleAsync(staffUser, "Staff"))
                    {
                        await _userManager.AddToRoleAsync(staffUser, "Staff");
                        _logger.LogInformation($"Added existing user {email} to Staff role");
                    }
                }
            }
        }

        private async Task SeedMemberProfilesAsync()
        {
            // Create member profiles for users that don't have one
            var users = await _userManager.Users.ToListAsync();

            foreach (var user in users)
            {
                // Check if the user already has a member profile
                var memberProfile = await _context.MemberProfiles
                    .FirstOrDefaultAsync(mp => mp.UserId == user.Id);

                if (memberProfile == null)
                {
                    // Create a new member profile for the user
                    memberProfile = new MemberProfile
                    {
                        UserId = user.Id,
                        Address = "123 Main St",
                        PhoneNumber = "555-123-4567",
                        JoinedAt = DateTime.UtcNow,
                        TotalOrders = 0,
                        Bookmarks = new List<Bookmark>(),
                        CartItems = new List<CartItem>(),
                        Orders = new List<Order>()
                    };

                    _context.MemberProfiles.Add(memberProfile);
                    _logger.LogInformation($"Created member profile for user: {user.Email}");
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
