using BookStore.DTOs.CartItem;

namespace BookStore.Services.CartItem
{
    public interface ICartService
    {
        Task<List<CartItemDTO>> GetCartItemsAsync(string memberId);
        Task<CartItemDTO> AddToCartAsync(string memberId, AddToCartDTO dto);
        Task<CartItemDTO> UpdateCartItemAsync(string memberId, int cartItemId, UpdateCartItemDTO dto);
        Task DeleteCartItemAsync(string memberId, int cartItemId);
        Task ClearCartAsync(string memberId);
    }
}
