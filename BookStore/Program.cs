using BookStore.Core.Extensions;
using BookStore.Data;
using BookStore.DatabaseContext;
using BookStore.Entities;
using BookStore.Hubs;
using BookStore.Mapping;
using BookStore.Services.Email;
using BookStore.Services.Notification;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

// Make the Program.cs file async
async Task Main(string[] args)
{
    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            // Configure JSON serialization options
            options.JsonSerializerOptions.PropertyNamingPolicy = null; // Use property names as-is
            options.JsonSerializerOptions.WriteIndented = true; // Pretty print JSON in development
            options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

    // Add API Explorer and Swagger
    builder.Services.AddEndpointsApiExplorer();

    // Add Database Context
    builder.Services.AddDbContext<BookStoreDBContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("BookStoreDB")));

    // Add Memory Cache
    builder.Services.AddMemoryCache();

    // Add Identity services
    builder.Services.AddIdentity<User, IdentityRole>(options =>
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

    // Add DbSeeder service
    builder.Services.AddScoped<DbSeeder>();

    // Add AutoMapper
    builder.Services.AddAutoMapper(typeof(BookStoreProfile), typeof(UserProfile));

    // Add Application Services
    builder.Services.AddApplicationServices();

    // Add SignalR
    builder.Services.AddSignalR();

    // Add Notification Service
    builder.Services.AddScoped<INotificationService, NotificationService>();

    // Add Email Service
    builder.Services.AddScoped<IEmailService, EmailService>();

    // Add OTP Service
    builder.Services.AddScoped<BookStore.Services.OTP.IOTPService, BookStore.Services.OTP.OTPService>();

    // Add Cookie Authentication
    builder.Services.AddCookieAuthentication();

    // Add CORS
    builder.Services.AddCorsConfiguration();

    // Add Authorization
    builder.Services.AddAuthorization();

    // Configure Swagger
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "BookVerse API",
            Version = "v1",
            Description = "API for BookVerse application - Your Journey Through Books",
            Contact = new OpenApiContact
            {
                Name = "BookVerse Team",
                Email = "support@bookverse.com"
            }
        });

        // Add security definition for cookie auth
        c.AddSecurityDefinition("CookieAuth", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Cookie,
            Name = "BookStore.Auth",
            Description = "Cookie authentication for BookVerse API"
        });

        // Add security requirement for endpoints
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "CookieAuth"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookVerse API v1");
            c.RoutePrefix = "swagger";
            c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        });

        // Add middleware to serve static files
        app.UseStaticFiles();

        // Add custom middleware for development
        app.UseCustomMiddleware();
    }
    else
    {
        app.UseHttpsRedirection();
        app.UseHsts();

        // Add custom middleware for production
        app.UseCustomMiddleware();
    }

    // Enable CORS - must be before auth middleware
    app.UseCors("AllowFrontend");

    // Important: UseAuthentication must come before UseAuthorization
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // Map SignalR hubs
    app.MapHub<NotificationHub>("/hubs/notification");

    // Seed the database
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var seeder = services.GetRequiredService<DbSeeder>();
            await seeder.SeedAsync();
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }

    app.Run();
}

// Create admin user
if (args.Length > 0 && args[0] == "--create-admin")
{
    BookStore.CreateAdminUser.CreateAdminUserAsync(args).GetAwaiter().GetResult();
}
// Update order subtotals
else if (args.Length > 0 && args[0] == "--UpdateOrderSubtotals")
{
    var host = WebApplication.CreateBuilder(args).Build();
    BookStore.UpdateOrderSubtotals.UpdateExistingOrders(host).GetAwaiter().GetResult();
}
else
{
    // Run the async Main method
    Main(args).GetAwaiter().GetResult();
}
