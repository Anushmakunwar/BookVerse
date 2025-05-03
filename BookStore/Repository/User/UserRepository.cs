using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Repository.User;

public class UserRepository (BookStoreDBContext context) : IUserRepository
{
    public async Task<Entities.User?> GetByEmailAsync(string email)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<Entities.User> CreateUserAsync(Entities.User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public async Task<Entities.MemberProfile> CreateMemberProfileAsync(Entities.MemberProfile memberProfile)
    {
        context.MemberProfiles.Add(memberProfile);
        await context.SaveChangesAsync();
        return memberProfile;
    }

    public async Task<Entities.MemberProfile?> GetMemberProfileByUserIdAsync(string userId)
    {
        return await context.MemberProfiles
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.UserId == userId);
    }

    public async Task<Entities.MemberProfile> UpdateMemberProfileAsync(Entities.MemberProfile memberProfile)
    {
        context.MemberProfiles.Update(memberProfile);
        await context.SaveChangesAsync();
        return memberProfile;
    }
}