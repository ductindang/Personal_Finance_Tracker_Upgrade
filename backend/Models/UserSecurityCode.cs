using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalFinanceTracker.Models
{
    public class UserSecurityCode
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [Required]
        [MaxLength(6)]
        public string Code { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string CodeType { get; set; } = null!; // "EmailVerification" or "PasswordReset"

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime ExpiryTime { get; set; }

        [Required]
        public bool IsUsed { get; set; } = false;
    }
}
