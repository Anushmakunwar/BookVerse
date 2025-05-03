using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BookStore.Entities;

public class Order
{
    [Key]
    public int Id { get; set; }

    public int MemberProfileId { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.Now;

    public bool IsCancelled { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal DiscountPercentage { get; set; }

    [MaxLength(100)]
    public string DiscountDescription { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ClaimCode { get; set; }

    public bool IsProcessed { get; set; }

    [ForeignKey("MemberProfileId")]
    public MemberProfile MemberProfile { get; set; }

    public ICollection<OrderItem> Items { get; set; }
}