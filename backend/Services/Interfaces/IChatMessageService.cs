using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Models.DTOs;

namespace PersonalFinanceTracker.Services.Interfaces
{
    public interface IChatMessageService
    {
        // Gửi tin nhắn mới (kèm validation và lọc XSS)
        Task<ChatMessageDto> SendMessageAsync(int senderId, int receiverId, string content);
        // Lấy lịch sử tin nhắn giữa 2 người dùng
        Task<List<ChatMessageDto>> GetConversationHistoryAsync(int currentUserId, int targetUserId, int page = 1, int pageSize = 30);
        // Lấy danh sách các cuộc hội thoại gần đây kèm tin nhắn cuối & badge chưa đọc
        Task<List<ChatConversationDto>> GetRecentConversationsAsync(int currentUserId);
        // Tìm kiếm người dùng khác trong hệ thống để bắt đầu chat
        Task<List<ChatUserDto>> SearchUsersAsync(int currentUserId, string? query);
        // Đếm tổng số tin nhắn chưa đọc
        Task<int> GetTotalUnreadCountAsync(int currentUserId);
        // Đánh dấu tất cả tin nhắn từ 1 người là đã đọc
        Task MarkMessagesAsReadAsync(int currentUserId, int senderId);
    }
}
