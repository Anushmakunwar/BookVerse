using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BookStore;

public static class UpdateOrderSubtotals
{
    public static async Task UpdateExistingOrders(IHost host)
    {
        using var scope = host.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookStoreDBContext>();
        
        // Get all orders where Subtotal is 0
        var orders = await dbContext.Orders
            .Where(o => o.Subtotal == 0)
            .ToListAsync();
        
        Console.WriteLine($"Found {orders.Count} orders to update");
        
        foreach (var order in orders)
        {
            // Set Subtotal equal to TotalAmount
            order.Subtotal = order.TotalAmount;
        }
        
        // Save changes
        await dbContext.SaveChangesAsync();
        
        Console.WriteLine("Order subtotals updated successfully");
    }
}
