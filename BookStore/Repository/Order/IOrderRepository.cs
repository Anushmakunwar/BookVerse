using BookStore.Entities;

namespace BookStore.Repository.Order
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Entities.Order>> GetOrdersByMemberIdAsync(int memberProfileId);
        Task<Entities.Order?> GetOrderByIdAsync(int orderId);
        Task<Entities.Order?> GetOrderByClaimCodeAsync(string claimCode);
        Task<Entities.Order> CreateOrderAsync(Entities.Order order);
        Task<Entities.Order> UpdateOrderAsync(Entities.Order order);
        Task<bool> CancelOrderAsync(int orderId);
        Task<bool> ProcessOrderAsync(int orderId);
        Task<IEnumerable<Entities.Order>> GetAllOrdersAsync(bool? processed = null);
    }
}
