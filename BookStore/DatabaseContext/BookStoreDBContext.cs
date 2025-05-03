using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookStore.DatabaseContext;

public class BookStoreDBContext : IdentityDbContext<Entities.User, IdentityRole, string>
{
    public BookStoreDBContext(DbContextOptions<BookStoreDBContext> options) : base(options)
    {
    }

    // Application entities
    public DbSet<Entities.User> Users { get; set; }
    public DbSet<Entities.MemberProfile> MemberProfiles { get; set; }
    public DbSet<Entities.Book> Books { get; set; }
    public DbSet<Entities.CartItem> CartItems { get; set; }
    public DbSet<Entities.Bookmark> Bookmarks { get; set; }
    public DbSet<Entities.Order> Orders { get; set; }
    public DbSet<Entities.OrderItem> OrderItems { get; set; }
    public DbSet<Entities.Review> Reviews { get; set; }
    public DbSet<Entities.Announcement> Announcements { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure the relationships and keys here if needed
        base.OnModelCreating(modelBuilder);
    }

}