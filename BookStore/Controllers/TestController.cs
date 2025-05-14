using BookStore.Services.Email;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<TestController> _logger;

        public TestController(IEmailService emailService, ILogger<TestController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet("test-email")]
        public async Task<IActionResult> TestEmail(string email = "test@example.com")
        {
            try
            {
                _logger.LogInformation("Testing email service by sending to {Email}", email);
                
                await _emailService.SendWelcomeEmailAsync(email, "Test User");
                
                _logger.LogInformation("Test email sent successfully to {Email}", email);
                
                return Ok(new { success = true, message = $"Test email sent to {email}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test email to {Email}", email);
                return StatusCode(500, new { success = false, message = $"Error sending email: {ex.Message}" });
            }
        }
    }
}
