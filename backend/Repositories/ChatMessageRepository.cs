using Microsoft.EntityFrameworkCore;
using PersonalFinanceTracker.Data;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Repositories.Interfaces;

namespace PersonalFinanceTracker.Repositories
{
    public class ChatMessageRepository : IChatMessageRepository
    {
        private readonly FinanceDbContext _context;

        public ChatMessageRepository(FinanceDbContext context)
        {
            _context = context;
        }

        public async Task AddMessageAsync(ChatMessage message)
        {
            await _context.ChatMessages.AddAsync(message);
        }

        public async Task<List<ChatMessage>> GetConversationMessagesAsync(int currentUserId, int targetUserId, int page = 1, int pageSize = 30)
        {
            return await _context.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => !m.IsDeleted &&
                    ((m.SenderId == currentUserId && m.ReceiverId == targetUserId) ||
                     (m.SenderId == targetUserId && m.ReceiverId == currentUserId)))
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .OrderBy(m => m.CreatedAt) // Đổi lại thứ tự tăng dần theo thời gian để client render từ trên xuống
                .ToListAsync();
        }

        public async Task<List<ChatMessage>> GetRecentMessagesForUserAsync(int currentUserId)
        {
            // Lấy tất cả tin nhắn liên quan đến user, sắp xếp mới nhất trước
            return await _context.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => !m.IsDeleted && (m.SenderId == currentUserId || m.ReceiverId == currentUserId))
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetTotalUnreadCountAsync(int currentUserId)
        {
            return await _context.ChatMessages.CountAsync(m => m.ReceiverId == currentUserId && !m.IsRead && !m.IsDeleted);
        }

        public async Task MarkMessagesAsReadAsync(int currentUserId, int senderId)
        {
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ReceiverId == currentUserId && m.SenderId == senderId && !m.IsRead)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                var now = DateTime.UtcNow;
                foreach(var msg in unreadMessages)
                {
                    msg.IsRead = true;
                    msg.ReadAt = now;
                }
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
