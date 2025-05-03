using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BookStore.Entities;

public class CartItem
{
    [Key]
    public int Id { get; set; }

    public int MemberProfileId { get; set; }

    public int BookId { get; set; }

    public int Quantity { get; set; }

    [ForeignKey("MemberProfileId")]
    public MemberProfile MemberProfile { get; set; }

    [ForeignKey("BookId")]
    public Book Book { get; set; }
}