using System.Collections.Generic;
using System.Threading.Tasks;
using PersonalFinanceTracker.Models;

namespace PersonalFinanceTracker.Repositories.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllCategoriesAsync(int userId);
    Task<Category?> GetByIdAsync(int id);
    Task<Category?> GetByNameAndTypeAsync(string name, string type, int userId);
    Task AddAsync(Category category);
    void Update(Category category);
    void Delete(Category category);
    void DeleteAll();
    Task AddRangeAsync(IEnumerable<Category> categories);
    Task SaveChangesAsync();
}
