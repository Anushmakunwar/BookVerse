using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace BookStore.Entities;

public class Announcement
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Message { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    [ForeignKey("CreatedById")]
    public User CreatedBy { get; set; }
}