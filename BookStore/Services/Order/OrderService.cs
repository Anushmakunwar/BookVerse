using AutoMapper;
using BookStore.Core.Common;
using BookStore.DTOs.Order;
using BookStore.Repository.Book;
using BookStore.Repository.CartItem;
using BookStore.Repository.Order;
using BookStore.Repository.User;
using BookStore.Services.Email;
using BookStore.Services.Notification;
using BookStore.Services.Utilities;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Services.Order
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IUserRepository _userRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderService> _logger;
        private readonly UserManager<Entities.User> _userManager;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public OrderService(
            IOrderRepository orderRepository,
            ICartItemRepository cartItemRepository,
            IUserRepository userRepository,
            IBookRepository bookRepository,
            IMapper mapper,
            ILogger<OrderService> logger,
            UserManager<Entities.User> userManager,
            INotificationService notificationService,
            IEmailService emailService)
        {
            _orderRepository = orderRepository;
            _cartItemRepository = cartItemRepository;
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _mapper = mapper;
            _logger = logger;
            _userManager = userManager;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<Result<OrderDTO>> CreateOrderFromCartAsync(string userId, CreateOrderDTO? createOrderDto = null)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<OrderDTO>.FailureResult("Member profile not found");
                }

                // Get cart items
                var cartItems = await _cartItemRepository.GetCartItemsByMemberIdAsync(userId);
                if (!cartItems.Any())
                {
                    return Result<OrderDTO>.FailureResult("Cart is empty");
                }

                // Check if all books are in stock
                foreach (var cartItem in cartItems)
                {
                    var book = await _bookRepository.GetByIdAsync(cartItem.BookId);
                    if (book == null || book.InventoryCount < cartItem.Quantity)
                    {
                        return Result<OrderDTO>.FailureResult($"Book '{book?.Title ?? "Unknown"}' is not available in the requested quantity");
                    }
                }

                // Calculate subtotal
                decimal subtotal = cartItems.Sum(ci => ci.Book.Price * ci.Quantity);
                decimal totalAmount = subtotal;

                // Apply discounts
                decimal discountPercentage = 0;
                string discountDescription = "";

                // 5% discount for orders with 5+ books
                int totalBooks = cartItems.Sum(ci => ci.Quantity);
                if (totalBooks >= 5)
                {
                    discountPercentage += 0.05m;
                    discountDescription += "5% volume discount";
                }

                // 10% stackable discount after 10 successful orders
                if (memberProfile.TotalOrders >= 10)
                {
                    discountPercentage += 0.10m;
                    discountDescription += discountDescription.Length > 0 ? ", 10% loyalty discount" : "10% loyalty discount";
                }

                // Log the discount calculation
                _logger.LogInformation(
                    "Discount calculation: Total books: {TotalBooks}, Total orders: {TotalOrders}, " +
                    "Discount percentage: {DiscountPercentage}, Description: {DiscountDescription}",
                    totalBooks, memberProfile.TotalOrders, discountPercentage, discountDescription);

                // Apply discount
                if (discountPercentage > 0)
                {
                    decimal discountAmount = subtotal * discountPercentage;
                    totalAmount = subtotal - discountAmount;
                }

                // Generate claim code
                string claimCode = ClaimCodeGenerator.GenerateClaimCode();

                // Create order
                var order = new Entities.Order
                {
                    MemberProfileId = memberProfile.Id,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = totalAmount,
                    Subtotal = subtotal,
                    DiscountPercentage = discountPercentage,
                    DiscountDescription = discountDescription,
                    ClaimCode = claimCode,
                    IsCancelled = false,
                    IsProcessed = false,
                    Items = new List<Entities.OrderItem>()
                };

                // Add order items
                foreach (var cartItem in cartItems)
                {
                    order.Items.Add(new Entities.OrderItem
                    {
                        BookId = cartItem.BookId,
                        Quantity = cartItem.Quantity
                    });

                    // Update book inventory
                    var book = await _bookRepository.GetByIdAsync(cartItem.BookId);
                    if (book != null)
                    {
                        book.InventoryCount -= cartItem.Quantity;
                        book.TotalSold += cartItem.Quantity;
                        await _bookRepository.UpdateAsync(book);
                    }
                }

                // Save order
                var createdOrder = await _orderRepository.CreateOrderAsync(order);

                // Update member profile
                memberProfile.TotalOrders++;
                await _userRepository.UpdateMemberProfileAsync(memberProfile);

                // Clear cart
                await _cartItemRepository.ClearCartAsync(userId);

                // Map to DTO
                var orderDto = _mapper.Map<OrderDTO>(createdOrder);

                // Generate order details for email
                var orderDetailsHtml = GenerateOrderDetailsHtml(cartItems, totalAmount, discountPercentage);

                // Send confirmation email with claim code
                await _emailService.SendOrderConfirmationAsync(
                    memberProfile.User.Email,
                    memberProfile.User.FullName,
                    claimCode,
                    orderDetailsHtml
                );

                // Broadcast notifications for each book purchased
                foreach (var item in cartItems)
                {
                    await _notificationService.BroadcastOrderNotificationAsync(
                        memberProfile.User.FullName,
                        item.Book.Title
                    );
                }

                return Result<OrderDTO>.SuccessResult(orderDto, "Order created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order for user {UserId}", userId);
                return Result<OrderDTO>.FailureResult("Failed to create order: " + ex.Message);
            }
        }

        public async Task<Result<List<OrderDTO>>> GetUserOrdersAsync(string userId)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<List<OrderDTO>>.FailureResult("Member profile not found");
                }

                // Get orders
                var orders = await _orderRepository.GetOrdersByMemberIdAsync(memberProfile.Id);

                // Map to DTOs
                var orderDtos = _mapper.Map<List<OrderDTO>>(orders);

                return Result<List<OrderDTO>>.SuccessResult(orderDtos, "Orders retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user {UserId}", userId);
                return Result<List<OrderDTO>>.FailureResult("Failed to get orders: " + ex.Message);
            }
        }

        public async Task<Result<OrderDTO>> GetOrderByIdAsync(string userId, int orderId)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<OrderDTO>.FailureResult("Member profile not found");
                }

                // Get order
                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return Result<OrderDTO>.FailureResult("Order not found");
                }

                // Check if the order belongs to the user
                if (order.MemberProfileId != memberProfile.Id)
                {
                    // Check if the user is an admin or staff
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user == null || (!await _userManager.IsInRoleAsync(user, "Admin") && !await _userManager.IsInRoleAsync(user, "Staff")))
                    {
                        return Result<OrderDTO>.FailureResult("You do not have permission to view this order");
                    }
                }

                // Map to DTO
                var orderDto = _mapper.Map<OrderDTO>(order);

                return Result<OrderDTO>.SuccessResult(orderDto, "Order retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId} for user {UserId}", orderId, userId);
                return Result<OrderDTO>.FailureResult("Failed to get order: " + ex.Message);
            }
        }

        public async Task<Result<bool>> CancelOrderAsync(string userId, int orderId)
        {
            try
            {
                // Get the member profile
                var memberProfile = await _userRepository.GetMemberProfileByUserIdAsync(userId);
                if (memberProfile == null)
                {
                    return Result<bool>.FailureResult("Member profile not found");
                }

                // Get order
                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return Result<bool>.FailureResult("Order not found");
                }

                // Check if the order belongs to the user
                if (order.MemberProfileId != memberProfile.Id)
                {
                    return Result<bool>.FailureResult("You do not have permission to cancel this order");
                }

                // Check if the order is already processed
                if (order.IsProcessed)
                {
                    return Result<bool>.FailureResult("Cannot cancel a processed order");
                }

                // Check if the order is already cancelled
                if (order.IsCancelled)
                {
                    return Result<bool>.FailureResult("Order is already cancelled");
                }

                // Cancel order
                var success = await _orderRepository.CancelOrderAsync(orderId);
                if (!success)
                {
                    return Result<bool>.FailureResult("Failed to cancel order");
                }

                // Return inventory
                foreach (var item in order.Items)
                {
                    var book = await _bookRepository.GetByIdAsync(item.BookId);
                    if (book != null)
                    {
                        book.InventoryCount += item.Quantity;
                        book.TotalSold -= item.Quantity;
                        await _bookRepository.UpdateAsync(book);
                    }
                }

                return Result<bool>.SuccessResult(true, "Order cancelled successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId} for user {UserId}", orderId, userId);
                return Result<bool>.FailureResult("Failed to cancel order: " + ex.Message);
            }
        }

        public async Task<Result<OrderDTO>> ProcessOrderAsync(string claimCode, string membershipId)
        {
            try
            {
                // If using auto-accept, call the simplified method
                if (membershipId == "auto-accept")
                {
                    _logger.LogInformation("Auto-accepting order with claim code {ClaimCode}", claimCode);
                    return await ProcessOrderByClaimCodeOnlyAsync(claimCode);
                }

                // Get order by claim code
                var order = await _orderRepository.GetOrderByClaimCodeAsync(claimCode);
                if (order == null)
                {
                    return Result<OrderDTO>.FailureResult("Order not found with the provided claim code");
                }

                // Check if the order is already processed
                if (order.IsProcessed)
                {
                    return Result<OrderDTO>.FailureResult("Order is already processed");
                }

                // Check if the order is cancelled
                if (order.IsCancelled)
                {
                    return Result<OrderDTO>.FailureResult("Cannot process a cancelled order");
                }

                // Verify membership ID matches the order's member
                if (order.MemberProfile?.User?.Id != membershipId)
                {
                    return Result<OrderDTO>.FailureResult("The provided membership ID does not match the order's owner");
                }

                // Process order
                var success = await _orderRepository.ProcessOrderAsync(order.Id);
                if (!success)
                {
                    return Result<OrderDTO>.FailureResult("Failed to process order");
                }

                // Get updated order
                var updatedOrder = await _orderRepository.GetOrderByIdAsync(order.Id);
                if (updatedOrder == null)
                {
                    return Result<OrderDTO>.FailureResult("Failed to retrieve updated order");
                }

                // Map to DTO
                var orderDto = _mapper.Map<OrderDTO>(updatedOrder);

                return Result<OrderDTO>.SuccessResult(orderDto, "Order processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order with claim code {ClaimCode} and membership ID {MembershipId}", claimCode, membershipId);
                return Result<OrderDTO>.FailureResult("Failed to process order: " + ex.Message);
            }
        }

        // New method that processes an order by claim code only, without membership ID verification
        private async Task<Result<OrderDTO>> ProcessOrderByClaimCodeOnlyAsync(string claimCode)
        {
            try
            {
                // Get order by claim code
                var order = await _orderRepository.GetOrderByClaimCodeAsync(claimCode);
                if (order == null)
                {
                    return Result<OrderDTO>.FailureResult("Order not found with the provided claim code");
                }

                // Check if the order is already processed
                if (order.IsProcessed)
                {
                    return Result<OrderDTO>.FailureResult("Order is already processed");
                }

                // Check if the order is cancelled
                if (order.IsCancelled)
                {
                    return Result<OrderDTO>.FailureResult("Cannot process a cancelled order");
                }

                _logger.LogInformation("Processing order #{OrderId} with claim code {ClaimCode} without membership verification",
                    order.Id, claimCode);

                // Process order
                var success = await _orderRepository.ProcessOrderAsync(order.Id);
                if (!success)
                {
                    return Result<OrderDTO>.FailureResult("Failed to process order");
                }

                // Get updated order
                var updatedOrder = await _orderRepository.GetOrderByIdAsync(order.Id);
                if (updatedOrder == null)
                {
                    return Result<OrderDTO>.FailureResult("Failed to retrieve updated order");
                }

                // Map to DTO
                var orderDto = _mapper.Map<OrderDTO>(updatedOrder);

                return Result<OrderDTO>.SuccessResult(orderDto, "Order processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order with claim code {ClaimCode} without membership verification", claimCode);
                return Result<OrderDTO>.FailureResult("Failed to process order: " + ex.Message);
            }
        }

        public async Task<Result<List<OrderDTO>>> GetAllOrdersAsync(bool? processed = null)
        {
            try
            {
                // Get orders
                var orders = await _orderRepository.GetAllOrdersAsync(processed);

                // Map to DTOs
                var orderDtos = _mapper.Map<List<OrderDTO>>(orders);

                return Result<List<OrderDTO>>.SuccessResult(orderDtos, "Orders retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                return Result<List<OrderDTO>>.FailureResult("Failed to get orders: " + ex.Message);
            }
        }

        private string GenerateOrderDetailsHtml(List<Entities.CartItem> cartItems, decimal totalAmount, decimal discountPercentage)
        {
            var sb = new System.Text.StringBuilder();

            // Start the table
            sb.Append(@"
                <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                    <thead>
                        <tr style='background-color: #f1f2f6;'>
                            <th style='padding: 10px; text-align: left; border-bottom: 1px solid #ddd;'>Book</th>
                            <th style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>Price</th>
                            <th style='padding: 10px; text-align: center; border-bottom: 1px solid #ddd;'>Quantity</th>
                            <th style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
            ");

            // Add each item
            foreach (var item in cartItems)
            {
                sb.Append($@"
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{item.Book.Title} by {item.Book.Author}</td>
                        <td style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>${item.Book.Price:F2}</td>
                        <td style='padding: 10px; text-align: center; border-bottom: 1px solid #ddd;'>{item.Quantity}</td>
                        <td style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>${item.Book.Price * item.Quantity:F2}</td>
                    </tr>
                ");
            }

            // Add subtotal
            var subtotal = cartItems.Sum(i => i.Book.Price * i.Quantity);
            sb.Append($@"
                    <tr>
                        <td colspan='3' style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'><strong>Subtotal:</strong></td>
                        <td style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>${subtotal:F2}</td>
                    </tr>
            ");

            // Add discount if applicable
            if (discountPercentage > 0)
            {
                var discountAmount = subtotal * discountPercentage;

                // Determine discount descriptions
                string discountText = "";
                if (cartItems.Sum(ci => ci.Quantity) >= 5)
                {
                    discountText += "5% volume discount (5+ books)";
                }

                if (cartItems.First().MemberProfile.TotalOrders >= 10)
                {
                    if (!string.IsNullOrEmpty(discountText))
                    {
                        discountText += ", ";
                    }
                    discountText += "10% loyalty discount (10+ orders)";
                }

                sb.Append($@"
                    <tr>
                        <td colspan='3' style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'><strong>Discount ({discountPercentage:P0}):</strong><br/><span style='font-size: 0.8em; color: #666;'>{discountText}</span></td>
                        <td style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>-${discountAmount:F2}</td>
                    </tr>
                ");
            }

            // Add total
            sb.Append($@"
                    <tr>
                        <td colspan='3' style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'><strong>Total:</strong></td>
                        <td style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'><strong>${totalAmount:F2}</strong></td>
                    </tr>
                </tbody>
            </table>
            ");

            return sb.ToString();
        }
    }
}
