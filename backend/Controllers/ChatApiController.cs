using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PersonalFinanceTracker.Services.Interfaces;
using System.Security.Claims;

namespace PersonalFinanceTracker.Controllers
{
    [Authorize]
    [Route("api/chat")]
    [ApiController]
    public class ChatApiController : ControllerBase
    {
        private readonly IChatMessageService _chatService;

        public ChatApiController(IChatMessageService chatService)
        {
            _chatService = chatService;
        }

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// GET /api/chat/conversations: Lấy danh sách bạn chat gần nhất kèm tin nhắn cuối và badge chưa đọc
        /// </summary>
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversation()
        {
            try
            {
                var conversations = await _chatService.GetRecentConversationsAsync(CurrentUserId);
                return Ok(conversations);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "Error when loading conservation lists.", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/chat/messages/{targetUserId}?page=1&pageSize=30: Tải lịch sử tin nhắn
        /// </summary>
        [HttpGet("messages/{targetUserId}")]
        public async Task<IActionResult> GetMessages(int targetUserId, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        {
            try
            {
                var messages = await _chatService.GetConversationHistoryAsync(CurrentUserId, targetUserId, page, pageSize);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error when loading message history.", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/chat/users?query=...: Tìm kiếm người dùng khác trong hệ thống để bắt đầu chat mới
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> SearchUsers([FromQuery] string? query)
        {
            try
            {
                var users = await _chatService.SearchUsersAsync(CurrentUserId, query);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error when searching user.", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/chat/unread-count: Đếm tổng số tin chưa đọc (để hiển thị badge đỏ trên nút nổi)
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetTotalUnreadCount()
        {
            try
            {
                var count = await _chatService.GetTotalUnreadCountAsync(CurrentUserId);
                return Ok(new { unreadCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error when counting unread message.", error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/chat/read/{senderId}: Đánh dấu đã đọc qua HTTP API
        /// </summary>
        [HttpPost("read/{senderId}")]
        public async Task<IActionResult> MarkAsRead(int senderId)
        {
            try
            {
                await _chatService.MarkMessagesAsReadAsync(CurrentUserId, senderId);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error when marking message read.", error = ex.Message });
            }
        }
    }
}
