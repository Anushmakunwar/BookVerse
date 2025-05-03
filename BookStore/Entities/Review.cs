using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BookStore.Entities;

public class Review
{
    [Key]
    public int Id { get; set; }

    public int BookId { get; set; }

    public int MemberProfileId { get; set; }

    [Required, MaxLength(1000)]
    public string Comment { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [ForeignKey("BookId")]
    public Book Book { get; set; }

    [ForeignKey("MemberProfileId")]
    public MemberProfile MemberProfile { get; set; }
}