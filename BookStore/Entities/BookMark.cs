using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BookStore.Entities;

public class Bookmark
{
    [Key]
    public int Id { get; set; }

    public int MemberProfileId { get; set; }

    public int BookId { get; set; }

    // Make CreatedAt nullable to handle cases where the column doesn't exist in the database
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("MemberProfileId")]
    public MemberProfile MemberProfile { get; set; }

    [ForeignKey("BookId")]
    public Book Book { get; set; }
}