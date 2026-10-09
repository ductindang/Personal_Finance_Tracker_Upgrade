namespace PersonalFinanceTracker.Models.DTOs
{
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatar { get; set; }

        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public bool IsFromMe { get; set; } // Giúp React biết bong bóng tin nhắn nằm bên trái hay bên phải
    }
}
