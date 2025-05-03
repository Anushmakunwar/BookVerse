namespace BookStore.Repository.User;
using BookStore.Entities;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateUserAsync(User user);
    Task<MemberProfile> CreateMemberProfileAsync(MemberProfile memberProfile);
    Task<MemberProfile?> GetMemberProfileByUserIdAsync(string userId);
    Task<MemberProfile> UpdateMemberProfileAsync(MemberProfile memberProfile);
}