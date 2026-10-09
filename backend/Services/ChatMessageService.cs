using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Models.DTOs;
using PersonalFinanceTracker.Repositories.Interfaces;
using PersonalFinanceTracker.Services.Interfaces;
using System.Net;

namespace PersonalFinanceTracker.Services
{
    public class ChatMessageService : IChatMessageService
    {
        private readonly IChatMessageRepository _chatRepository;
        private readonly IUserRepository _userRepository;

        public ChatMessageService(IChatMessageRepository chatRepository, IUserRepository userRepository)
        {
            _chatRepository = chatRepository;
            _userRepository = userRepository;
        }

        public async Task<ChatMessageDto> SendMessageAsync(int senderId, int receiverId, string content)
        {
            if (string.IsNullOrEmpty(content))
            {
                throw new ArgumentException("Content of message can not empty.", nameof(content));
            }

            if(senderId == receiverId)
            {
                throw new InvalidOperationException("Unable to send messages to myself.");
            }

            var sender = await _userRepository.GetByIdAsync(senderId);
            var receiver = await _userRepository.GetByIdAsync(receiverId);

            if (sender == null || receiver == null)
            {
                throw new KeyNotFoundException("This user do not exist in the system");
            }

            // Phòng chống XSS: Mã hóa an toàn nội dung trước khi lưu DB
            var sanitizedContent = WebUtility.HtmlEncode(content.Trim());

            var message = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = sanitizedContent,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _chatRepository.AddMessageAsync(message);
            await _chatRepository.SaveChangesAsync();

            return new ChatMessageDto
            {
                Id = message.Id,
                SenderId = senderId,
                SenderName = sender.FullName ?? sender.Username,
                SenderAvatar = sender.ProfilePictureUrl,
                ReceiverId = receiverId,
                ReceiverName = receiver.FullName ?? receiver.Username,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                IsRead = false,
                IsFromMe = true
            };
        }

        public async Task<List<ChatMessageDto>> GetConversationHistoryAsync(int currentUserId, int targetUserId, int page = 1, int pageSize = 30)
        {
            var messages = await _chatRepository.GetConversationMessagesAsync(currentUserId, targetUserId, page, pageSize);

            return messages.Select(m => new ChatMessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender.FullName ?? m.Sender.Username,
                SenderAvatar = m.Sender.ProfilePictureUrl,
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver.FullName ?? m.Receiver.Username,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead,
                IsFromMe = m.SenderId == currentUserId
            }).ToList();
        }

        public async Task<List<ChatConversationDto>> GetRecentConversationsAsync(int currentUserId)
        {
            var rawMessages = await _chatRepository.GetRecentMessagesForUserAsync(currentUserId);

            // Gom nhóm tin nhắn theo đối phương (người chat cùng)
            // Nếu tôi là người gửi thì đối phương là ReceiverId.
            // Nếu tôi là người nhận thì đối phương là SenderId.
            var conversationGroups = rawMessages.GroupBy(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId);

            var result = new List<ChatConversationDto>();

            // Duyệt qua từng cuộc trò chuyện của từng đối phương
            foreach (var group in conversationGroups)
            {
                var contactId = group.Key; // ID của đối phương

                // Vì rawMessages đã được sắp xếp giảm dần theo thời gian,
                // nên phần tử đầu tiên của nhóm chính là tin nhắn mới nhất
                var latestMessage = group.OrderByDescending(m => m.CreatedAt).First();

                // Xác định đối tượng User của đối phương để lấy Avatar và Tên
                var contact = latestMessage.SenderId == currentUserId ? latestMessage.Receiver : latestMessage.Sender;

                var unreadCount = group.Count(m => m.ReceiverId == currentUserId && !m.IsRead);

                result.Add(new ChatConversationDto
                {
                    ContactUserId = contactId,
                    ContactName = contact.FullName ?? contact.Username,
                    ContactAvatar = contact.ProfilePictureUrl,
                    LastMessage = latestMessage.Content,
                    LastMessageTime = latestMessage.CreatedAt,
                    UnreadCount = unreadCount
                });
            }

            // Sắp xếp danh sách hội thoại: Ai vừa nhắn tin gần nhất sẽ nhảy lên đầu danh sách
            return result.OrderByDescending(c => c.LastMessageTime).ToList();
        }

        public async Task<List<ChatUserDto>> SearchUsersAsync(int currentUserId, string? query)
        {
            var users = await _userRepository.GetOtherUsersAsync(currentUserId, query);
            return users.Select(u => new ChatUserDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                ProfilePictureUrl = u.ProfilePictureUrl
            }).ToList();
        }
        public async Task<int> GetTotalUnreadCountAsync(int currentUserId)
        {
            return await _chatRepository.GetTotalUnreadCountAsync(currentUserId);
        }
        public async Task MarkMessagesAsReadAsync(int currentUserId, int senderId)
        {
            await _chatRepository.MarkMessagesAsReadAsync(currentUserId, senderId);
            await _chatRepository.SaveChangesAsync();
        }

    }
}
