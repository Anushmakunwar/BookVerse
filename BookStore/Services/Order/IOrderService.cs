using BookStore.Core.Common;
using BookStore.DTOs.Order;

namespace BookStore.Services.Order
{
    public interface IOrderService
    {
        Task<Result<OrderDTO>> CreateOrderFromCartAsync(string userId, CreateOrderDTO? createOrderDto = null);
        Task<Result<List<OrderDTO>>> GetUserOrdersAsync(string userId);
        Task<Result<OrderDTO>> GetOrderByIdAsync(string userId, int orderId);
        Task<Result<bool>> CancelOrderAsync(string userId, int orderId);
        Task<Result<OrderDTO>> ProcessOrderAsync(string claimCode, string membershipId);
        Task<Result<List<OrderDTO>>> GetAllOrdersAsync(bool? processed = null);
    }
}
