using BookStore.Entities;

namespace BookStore.Repository.CartItem
{
    public interface ICartItemRepository
    {
        Task<List<Entities.CartItem>> GetCartItemsByMemberIdAsync(string memberId);
        Task<Entities.CartItem?> GetCartItemAsync(string memberId, int bookId);
        Task<Entities.CartItem> AddCartItemAsync(Entities.CartItem cartItem);
        Task<Entities.CartItem> UpdateCartItemAsync(Entities.CartItem cartItem);
        Task DeleteCartItemAsync(int cartItemId);
        Task ClearCartAsync(string memberId);
    }
}
