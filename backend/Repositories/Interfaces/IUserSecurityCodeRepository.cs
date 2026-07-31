using System;
using System.Threading.Tasks;
using PersonalFinanceTracker.Models;

namespace PersonalFinanceTracker.Repositories.Interfaces;

public interface IUserSecurityCodeRepository
{
    Task<UserSecurityCode?> GetLatestActiveCodeAsync(int userId, string codeType);
    Task<UserSecurityCode?> GetLatestCodeAsync(int userId, string codeType);
    Task AddAsync(UserSecurityCode securityCode);
    void Update(UserSecurityCode securityCode);
    Task SaveChangesAsync();
    Task ClearExpiredOrUsedCodesAsync(DateTime beforeTime);
}
