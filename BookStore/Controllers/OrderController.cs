using BookStore.DTOs.Order;
using BookStore.Services.Order;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger;
        private readonly UserManager<Entities.User> _userManager;

        public OrderController(
            IOrderService orderService,
            ILogger<OrderController> logger,
            UserManager<Entities.User> userManager)
        {
            _orderService = orderService;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserOrders()
        {
            try
            {
                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                var result = await _orderService.GetUserOrdersAsync(userId);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, orders = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user orders");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                var result = await _orderService.GetOrderByIdAsync(userId, id);
                if (!result.Success)
                {
                    if (result.Message.Contains("permission"))
                    {
                        return Forbid();
                    }
                    return NotFound(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, order = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDTO? createOrderDto = null)
        {
            try
            {
                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                // Check if user is an admin - admins should not create orders
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Forbid("Admin users cannot create orders");
                }

                var result = await _orderService.CreateOrderFromCartAsync(userId, createOrderDto);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return CreatedAtAction(nameof(GetOrderById), new { id = result.Data.Id }, new { success = true, order = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                // Get the user ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }

                var result = await _orderService.CancelOrderAsync(userId, id);
                if (!result.Success)
                {
                    if (result.Message.Contains("permission"))
                    {
                        return Forbid();
                    }
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost("process")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> ProcessOrder([FromBody] ProcessOrderDTO processOrderDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                _logger.LogInformation("Processing order with claim code {ClaimCode} and membership ID {MembershipId}",
                    processOrderDto.ClaimCode, processOrderDto.MembershipId);

                var result = await _orderService.ProcessOrderAsync(processOrderDto.ClaimCode, processOrderDto.MembershipId);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("Order processed successfully: Order #{OrderId}", result.Data.Id);
                return Ok(new { success = true, order = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order with claim code {ClaimCode} and membership ID {MembershipId}",
                    processOrderDto.ClaimCode, processOrderDto.MembershipId);
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] bool? processed = null)
        {
            try
            {
                var result = await _orderService.GetAllOrdersAsync(processed);
                if (!result.Success)
                {
                    return BadRequest(new { success = false, message = result.Message });
                }

                return Ok(new { success = true, orders = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }
    }
}
