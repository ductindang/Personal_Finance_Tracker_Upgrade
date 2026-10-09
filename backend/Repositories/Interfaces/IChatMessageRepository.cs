using PersonalFinanceTracker.Models;

namespace PersonalFinanceTracker.Repositories.Interfaces
{
    public interface IChatMessageRepository
    {
        // Lưu tin nhắn mới
        Task AddMessageAsync(ChatMessage message);

        // Lấy lịch sử trò chuyện giữa 2 người dùng (có phân trang)
        Task<List<ChatMessage>> GetConversationMessagesAsync(int currentUserId, int targetUserId, int page = 1, int pageSize = 30);

        // Lấy tin nhắn mới nhất của từng cuộc hội thoại mà user đã tham gia
        Task<List<ChatMessage>> GetRecentMessagesForUserAsync(int currentUserId);

        // Đếm tổng số tin nhắn chưa đọc của user
        Task<int> GetTotalUnreadCountAsync(int currentUserId);

        // Đánh dấu tất cả tin nhắn từ 1 người gửi cụ thể là đã đọc
        Task MarkMessagesAsReadAsync(int currentUserId, int senderId);

        // Lưu thay đổi vào DB
        Task SaveChangesAsync();
    }
}
