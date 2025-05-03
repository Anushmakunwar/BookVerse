using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Repository.Order
{
    public class OrderRepository : IOrderRepository
    {
        private readonly BookStoreDBContext _context;
        private readonly ILogger<OrderRepository> _logger;

        public OrderRepository(BookStoreDBContext context, ILogger<OrderRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Entities.Order>> GetOrdersByMemberIdAsync(int memberProfileId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Book)
                    .Where(o => o.MemberProfileId == memberProfileId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for member {MemberProfileId}", memberProfileId);
                throw;
            }
        }

        public async Task<Entities.Order?> GetOrderByIdAsync(int orderId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Book)
                    .Include(o => o.MemberProfile)
                    .FirstOrDefaultAsync(o => o.Id == orderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order with ID {OrderId}", orderId);
                throw;
            }
        }

        public async Task<Entities.Order?> GetOrderByClaimCodeAsync(string claimCode)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Book)
                    .Include(o => o.MemberProfile)
                    .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order with claim code {ClaimCode}", claimCode);
                throw;
            }
        }

        public async Task<Entities.Order> CreateOrderAsync(Entities.Order order)
        {
            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order for member {MemberProfileId}", order.MemberProfileId);
                throw;
            }
        }

        public async Task<Entities.Order> UpdateOrderAsync(Entities.Order order)
        {
            try
            {
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order with ID {OrderId}", order.Id);
                throw;
            }
        }

        public async Task<bool> CancelOrderAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                {
                    return false;
                }

                if (order.IsProcessed)
                {
                    return false; // Cannot cancel processed orders
                }

                order.IsCancelled = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order with ID {OrderId}", orderId);
                throw;
            }
        }

        public async Task<bool> ProcessOrderAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                {
                    return false;
                }

                if (order.IsCancelled)
                {
                    return false; // Cannot process cancelled orders
                }

                order.IsProcessed = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order with ID {OrderId}", orderId);
                throw;
            }
        }

        public async Task<IEnumerable<Entities.Order>> GetAllOrdersAsync(bool? processed = null)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Book)
                    .Include(o => o.MemberProfile)
                    .OrderByDescending(o => o.OrderDate)
                    .AsQueryable();

                if (processed.HasValue)
                {
                    query = query.Where(o => o.IsProcessed == processed.Value);
                }

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                throw;
            }
        }
    }
}
