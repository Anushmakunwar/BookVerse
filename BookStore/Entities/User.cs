using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace BookStore.Entities;

enum UserRole
{
    Member,
    Admin,
    Staff
}

public class User : IdentityUser
{
    [Required]
    public String FullName { get; set; } = string.Empty;

    public MemberProfile? MemberProfile { get; set; }
}