namespace BookStore.Services.Utilities
{
    public static class ClaimCodeGenerator
    {
        private static readonly Random _random = new Random();
        private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing characters like I, O, 0, 1

        public static string GenerateClaimCode(int length = 8)
        {
            return new string(Enumerable.Repeat(Chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }
    }
}
