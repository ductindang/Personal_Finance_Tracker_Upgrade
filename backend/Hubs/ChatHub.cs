using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using PersonalFinanceTracker.Models.DTOs;
using PersonalFinanceTracker.Services.Interfaces;
using System.Security.Claims;

namespace PersonalFinanceTracker.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatMessageService _chatService;

        public ChatHub(IChatMessageService chatService)
        {
            _chatService = chatService;
        }

        // Lấy id của người đang gọi Socket từ Cookie Auth
        private int CurrentUserId
        {
            get
            {
                var idStf = Context.UserIdentifier ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(idStf, out var id) ? id : 0;
            }
        }

        /// <summary>
        /// Client React gọi hàm này khi bấm nút "Gửi" tin nhắn
        /// </summary>
        public async Task SendMessage(int receiverId, string content)
        {
            if (CurrentUserId == 0 || string.IsNullOrWhiteSpace(content)) return;

            // Gọi service để validate, lọc XSS và lưu DB
            var messageDto = await _chatService.SendMessageAsync(CurrentUserId, receiverId, content);

            // Khi gửi cho người nhận, IsFromMe sẽ là false
            var receiverMessageDto = new ChatMessageDto
            {
                Id = messageDto.Id,
                SenderId = messageDto.SenderId,
                SenderName = messageDto.SenderName,
                SenderAvatar = messageDto.SenderAvatar,
                ReceiverId = messageDto.ReceiverId,
                ReceiverName = messageDto.ReceiverName,
                Content = messageDto.Content,
                CreatedAt = messageDto.CreatedAt,
                IsRead = false,
                IsFromMe = false
            };

            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", receiverMessageDto);

            // Phản hồi lại cho chính người gửi (Caller) để cập nhật tin nhắn vào khung chat
            await Clients.Caller.SendAsync("MessageSent", messageDto);
        }

        /// <summary>
        /// Báo hiệu trạng thái đang gõ phím (Typing Indicator)
        /// </summary>
        public async Task SendTypingNotification(int receiverId, bool isTyping)
        {
            if (CurrentUserId == 0) return;

            await Clients.User(receiverId.ToString()).SendAsync("UserTyping", CurrentUserId, isTyping);
        }

        /// <summary>
        /// Báo cho đối phương biết mình đã đọc tin nhắn của họ
        /// </summary>
        public async Task MarkAsRead(int senderId)
        {
            if(CurrentUserId == 0) return;

            // Cập nhật DB
            await _chatService.MarkMessagesAsReadAsync(CurrentUserId, senderId);

            // Bắn Realtime cho người gửi để họ thất biểu tượng đã xem (2 dấu tích xanh chẳng hạn)
            await Clients.User(senderId.ToString()).SendAsync("MessagesRead", CurrentUserId);
        }

        public override async Task OnConnectedAsync()
        {
            // Được gọi mỗi khi người dùng mở trang web và kết nối tới SignalR
            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            // Được gọi khi người dùng tắt tab hoặc mất mạng
            return base.OnDisconnectedAsync(exception);
        }
    }
}
