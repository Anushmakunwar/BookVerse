using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.Entities;

public class MemberProfile
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public User User { get; set; }

    [Required]
    public string Address { get; set; }

    [Required]
    public string PhoneNumber { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public int TotalOrders { get; set; }

    public ICollection<Bookmark> Bookmarks { get; set; }
    public ICollection<CartItem> CartItems { get; set; }
    public ICollection<Order> Orders { get; set; }
}