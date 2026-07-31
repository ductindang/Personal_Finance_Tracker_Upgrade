using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceTracker.Data;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Repositories.Interfaces;

namespace PersonalFinanceTracker.Repositories;

public class UserSecurityCodeRepository : IUserSecurityCodeRepository
{
    private readonly FinanceDbContext _context;

    public UserSecurityCodeRepository(FinanceDbContext context)
    {
        _context = context;
    }

    public async Task<UserSecurityCode?> GetLatestActiveCodeAsync(int userId, string codeType)
    {
        return await _context.UserSecurityCodes
            .Where(c => c.UserId == userId && c.CodeType == codeType && !c.IsUsed && c.ExpiryTime > DateTime.UtcNow)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<UserSecurityCode?> GetLatestCodeAsync(int userId, string codeType)
    {
        return await _context.UserSecurityCodes
            .Where(c => c.UserId == userId && c.CodeType == codeType)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task AddAsync(UserSecurityCode securityCode)
    {
        await _context.UserSecurityCodes.AddAsync(securityCode);
    }

    public void Update(UserSecurityCode securityCode)
    {
        _context.UserSecurityCodes.Update(securityCode);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task ClearExpiredOrUsedCodesAsync(DateTime beforeTime)
    {
        var expiredOrUsed = await _context.UserSecurityCodes
            .Where(c => c.IsUsed || c.ExpiryTime < beforeTime)
            .ToListAsync();

        if (expiredOrUsed.Any())
        {
            _context.UserSecurityCodes.RemoveRange(expiredOrUsed);
            await _context.SaveChangesAsync();
        }
    }
}
