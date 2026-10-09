namespace PersonalFinanceTracker.Models.DTOs
{
    public class ChatConversationDto
    {
        public int ContactUserId { get; set;  }
        public string ContactName { get; set; } = string.Empty;
        public string? ContactAvatar { get; set; }
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageTime { get; set; }
        public int UnreadCount { get; set; }
    }
}
