using BookStore.DTOs.CartItem;
using BookStore.Repository.CartItem;
using BookStore.Repository.User;
using BookStore.Repository.Book;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Services.CartItem
{
    public class CartService : ICartService
    {
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IUserRepository _userRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<CartService> _logger;

        public CartService(
            ICartItemRepository cartItemRepository,
            IUserRepository userRepository,
            IBookRepository bookRepository,
            ILogger<CartService> logger)
        {
            _cartItemRepository = cartItemRepository;
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _logger = logger;
        }

        public async Task<List<CartItemDTO>> GetCartItemsAsync(string memberId)
        {
            try
            {
                var cartItems = await _cartItemRepository.GetCartItemsByMemberIdAsync(memberId);

                return cartItems.Select(c => new CartItemDTO
                {
                    Id = c.Id,
                    BookId = c.Book.Id,
                    BookTitle = c.Book.Title,
                    BookAuthor = c.Book.Author,
                    Price = c.Book.Price,
                    Quantity = c.Quantity,
                    CoverImage = c.Book.CoverImage
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart items for member {MemberId}", memberId);
                throw;
            }
        }

        public async Task<CartItemDTO> AddToCartAsync(string memberId, AddToCartDTO dto)
        {
            try
            {
                // Get the member profile
                var member = await _userRepository.GetMemberProfileByUserIdAsync(memberId);
                if (member == null)
                {
                    throw new Exception($"Member profile not found for user ID {memberId}");
                }

                // Get the book
                var book = await _bookRepository.GetByIdAsync(dto.BookId);
                if (book == null)
                {
                    throw new Exception($"Book not found with ID {dto.BookId}");
                }

                // Check if the book is already in the cart
                var existingCartItem = await _cartItemRepository.GetCartItemAsync(memberId, dto.BookId);
                if (existingCartItem != null)
                {
                    // Update the quantity
                    existingCartItem.Quantity += dto.Quantity;
                    await _cartItemRepository.UpdateCartItemAsync(existingCartItem);

                    return new CartItemDTO
                    {
                        Id = existingCartItem.Id,
                        BookId = book.Id,
                        BookTitle = book.Title,
                        BookAuthor = book.Author,
                        Price = book.Price,
                        Quantity = existingCartItem.Quantity,
                        CoverImage = book.CoverImage
                    };
                }

                // Create a new cart item
                var cartItem = new Entities.CartItem
                {
                    MemberProfile = member,
                    Book = book,
                    Quantity = dto.Quantity
                };

                var addedCartItem = await _cartItemRepository.AddCartItemAsync(cartItem);

                return new CartItemDTO
                {
                    Id = addedCartItem.Id,
                    BookId = book.Id,
                    BookTitle = book.Title,
                    BookAuthor = book.Author,
                    Price = book.Price,
                    Quantity = addedCartItem.Quantity,
                    CoverImage = book.CoverImage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding book {BookId} to cart for member {MemberId}", dto.BookId, memberId);
                throw;
            }
        }

        public async Task<CartItemDTO> UpdateCartItemAsync(string memberId, int cartItemId, UpdateCartItemDTO dto)
        {
            try
            {
                // Get the member profile
                var member = await _userRepository.GetMemberProfileByUserIdAsync(memberId);
                if (member == null)
                {
                    throw new Exception($"Member profile not found for user ID {memberId}");
                }

                // Get all cart items for the member
                var cartItems = await _cartItemRepository.GetCartItemsByMemberIdAsync(memberId);

                // Find the specific cart item
                var cartItem = cartItems.FirstOrDefault(c => c.Id == cartItemId);
                if (cartItem == null)
                {
                    throw new Exception($"Cart item not found with ID {cartItemId} for member {member.Id}");
                }

                // Update the quantity
                cartItem.Quantity = dto.Quantity;
                await _cartItemRepository.UpdateCartItemAsync(cartItem);

                return new CartItemDTO
                {
                    Id = cartItem.Id,
                    BookId = cartItem.Book.Id,
                    BookTitle = cartItem.Book.Title,
                    BookAuthor = cartItem.Book.Author,
                    Price = cartItem.Book.Price,
                    Quantity = cartItem.Quantity,
                    CoverImage = cartItem.Book.CoverImage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item {CartItemId} for member {MemberId}", cartItemId, memberId);
                throw;
            }
        }

        public async Task DeleteCartItemAsync(string memberId, int cartItemId)
        {
            try
            {
                // Get the member profile
                var member = await _userRepository.GetMemberProfileByUserIdAsync(memberId);
                if (member == null)
                {
                    throw new Exception($"Member profile not found for user ID {memberId}");
                }

                // Get all cart items for the member
                var cartItems = await _cartItemRepository.GetCartItemsByMemberIdAsync(memberId);

                // Find the specific cart item
                var cartItem = cartItems.FirstOrDefault(c => c.Id == cartItemId);
                if (cartItem == null)
                {
                    throw new Exception($"Cart item not found with ID {cartItemId} for member {member.Id}");
                }

                // Delete the cart item
                await _cartItemRepository.DeleteCartItemAsync(cartItemId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cart item {CartItemId} for member {MemberId}", cartItemId, memberId);
                throw;
            }
        }

        public async Task ClearCartAsync(string memberId)
        {
            try
            {
                // Get the member profile
                var member = await _userRepository.GetMemberProfileByUserIdAsync(memberId);
                if (member == null)
                {
                    throw new Exception($"Member profile not found for user ID {memberId}");
                }

                // Clear the cart
                await _cartItemRepository.ClearCartAsync(memberId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart for member {MemberId}", memberId);
                throw;
            }
        }
    }
}
