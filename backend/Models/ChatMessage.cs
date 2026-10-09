namespace PersonalFinanceTracker.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        // Sender
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        // Receiver
        public int ReceiverId { get; set; }
        public User Receiver { get; set; } = null!;

        // Message content
        public string Content { get; set; } = null!;

        // Sending time (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Read status
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }

        // Mark soft-delete
        public bool IsDeleted { get; set; } = false;


    }
}
