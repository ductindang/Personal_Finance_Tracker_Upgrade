namespace PersonalFinanceTracker.Models.DTOs
{
    public class ChatUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string DisplayName => !string.IsNullOrWhiteSpace(FullName) ? FullName : Username;
    }
}
