using BookStore.Data;
using BookStore.DatabaseContext;
using BookStore.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BookStore
{
    public class CreateAdminUser
    {
        public static async Task CreateAdminUserAsync(string[] args)
        {
            // Create a service collection
            var services = new ServiceCollection();

            // Add logging
            services.AddLogging(configure => configure.AddConsole());

            // Add DbContext
            services.AddDbContext<BookStoreDBContext>(options =>
                options.UseNpgsql("Server=localhost;Database=BookStore;User Id=postgres;Password=Belbari890;"));

            // Add Identity services
            services.AddIdentity<User, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 6;

                // User settings
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<BookStoreDBContext>()
            .AddDefaultTokenProviders();

            // Build the service provider
            var serviceProvider = services.BuildServiceProvider();

            // Get the required services
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var logger = serviceProvider.GetRequiredService<ILogger<CreateAdminUser>>();
            var dbContext = serviceProvider.GetRequiredService<BookStoreDBContext>();

            // Create the database and apply migrations
            logger.LogInformation("Creating database and applying migrations...");
            dbContext.Database.EnsureDeleted(); // Delete the database if it exists
            dbContext.Database.EnsureCreated(); // Create the database with all tables

            try
            {
                // Create roles if they don't exist
                string[] roleNames = { "Admin", "Member", "Staff" };

                foreach (var roleName in roleNames)
                {
                    var roleExists = await roleManager.RoleExistsAsync(roleName);
                    if (!roleExists)
                    {
                        await roleManager.CreateAsync(new IdentityRole(roleName));
                        logger.LogInformation($"Created role: {roleName}");
                    }
                }

                // Create admin user if it doesn't exist
                var adminEmail = "admin@gmail.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);

                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true,
                        FullName = "Admin User"
                    };

                    var result = await userManager.CreateAsync(adminUser, "password");

                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        logger.LogInformation($"Created admin user: {adminEmail}");
                    }
                    else
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        logger.LogError($"Failed to create admin user. Errors: {errors}");
                    }
                }
                else
                {
                    // Ensure the user is in the Admin role
                    if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        logger.LogInformation($"Added existing user {adminEmail} to Admin role");
                    }
                }

                logger.LogInformation("Admin user creation process completed.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while creating the admin user.");
            }
        }
    }
}
