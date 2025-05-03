using BookStore.DTOs.CartItem;
using BookStore.Services.CartItem;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;
        private readonly UserManager<Entities.User> _userManager;

        public CartController(ICartService cartService, ILogger<CartController> logger, UserManager<Entities.User> userManager)
        {
            _cartService = cartService;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                // Get the user ID from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }
                
                // Check if user is an admin - admins should not use cart
                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Forbid("Admin users cannot use cart functionality");
                }

                var userId = userIdClaim;
                var cartItems = await _cartService.GetCartItemsAsync(userId);

                return Ok(new {
                    success = true,
                    items = cartItems,
                    totalItems = cartItems.Sum(c => c.Quantity),
                    totalPrice = cartItems.Sum(c => c.TotalPrice)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDTO dto)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                // Get the user ID from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }
                
                // Check if user is an admin - admins should not use cart
                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Forbid("Admin users cannot use cart functionality");
                }

                var userId = userIdClaim;
                var cartItem = await _cartService.AddToCartAsync(userId, dto);

                return Ok(new { success = true, item = cartItem });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to cart: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemDTO dto)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                // Get the user ID from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }
                
                // Check if user is an admin - admins should not use cart
                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Forbid("Admin users cannot use cart functionality");
                }

                var userId = userIdClaim;
                var cartItem = await _cartService.UpdateCartItemAsync(userId, id, dto);

                return Ok(new { success = true, item = cartItem });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromCart(int id)
        {
            try
            {
                // Get the user ID from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }
                
                // Check if user is an admin - admins should not use cart
                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Forbid("Admin users cannot use cart functionality");
                }

                var userId = userIdClaim;
                await _cartService.DeleteCartItemAsync(userId, id);

                return Ok(new { success = true, message = "Item removed from cart" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from cart: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                // Get the user ID from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogWarning("User ID claim not found in claims");
                    return Unauthorized();
                }
                
                // Check if user is an admin - admins should not use cart
                var user = await _userManager.FindByIdAsync(userIdClaim);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    return Forbid("Admin users cannot use cart functionality");
                }

                var userId = userIdClaim;
                await _cartService.ClearCartAsync(userId);

                return Ok(new { success = true, message = "Cart cleared" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
