using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Repository.CartItem
{
    public class CartItemRepository : ICartItemRepository
    {
        private readonly BookStoreDBContext _context;

        public CartItemRepository(BookStoreDBContext context)
        {
            _context = context;
        }

        public async Task<List<Entities.CartItem>> GetCartItemsByMemberIdAsync(string memberId)
        {
            return await _context.CartItems
                .Include(c => c.Book)
                .Where(c => c.MemberProfile.UserId == memberId)
                .ToListAsync();
        }

        public async Task<Entities.CartItem?> GetCartItemAsync(string memberId, int bookId)
        {
            return await _context.CartItems
                .Include(c => c.Book)
                .FirstOrDefaultAsync(c => c.MemberProfile.UserId == memberId && c.Book.Id == bookId);
        }

        public async Task<Entities.CartItem> AddCartItemAsync(Entities.CartItem cartItem)
        {
            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task<Entities.CartItem> UpdateCartItemAsync(Entities.CartItem cartItem)
        {
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task DeleteCartItemAsync(int cartItemId)
        {
            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem != null)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClearCartAsync(string memberId)
        {
            var cartItems = await _context.CartItems
                .Where(c => c.MemberProfile.UserId == memberId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
        }
    }
}
