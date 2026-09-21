using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Repositories.Interfaces;
using PersonalFinanceTracker.Services.Interfaces;

namespace PersonalFinanceTracker.Services;

public class SavingsService : ISavingsService
{
    private readonly ISavingsGoalRepository _savingsGoalRepository;
    private readonly ITransactionRepository _transactionRepository;

    public SavingsService(ISavingsGoalRepository savingsGoalRepository, ITransactionRepository transactionRepository)
    {
        _savingsGoalRepository = savingsGoalRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<List<SavingsGoal>> GetSavingsGoalsAsync(int userId)
    {
        return await _savingsGoalRepository.GetAllGoalsAsync(userId);
    }

    public async Task<(bool Success, string? ErrorMessage, SavingsGoal? Goal)> SaveGoalAsync(int userId, SavingsGoal model)
    {
        if (model == null || model.TargetAmount <= 0 || string.IsNullOrWhiteSpace(model.Title))
        {
            return (false, "Invalid goal payload.", null);
        }

        if (model.CurrentAmount < 0)
        {
            return (false, "Current amount cannot be negative.", null);
        }

        // 1. Tính toán số dư khả dụng trong ví chính
        var (income, expense) = await _transactionRepository.GetIncomeAndExpenseTotalsAsync(userId);
        var savings = await _savingsGoalRepository.GetTotalSavingsAsync(userId);
        var spendableBalance = income - expense - savings;

        if (model.Id == 0)
        {
            // 2. Nếu tạo mới và có nhập số tiền nạp ban đầu (Initial Savings > 0)
            if (model.CurrentAmount > 0 && spendableBalance < model.CurrentAmount)
            {
                return (false, "Insufficient spendable balance for initial savings.", null);
            }

            model.UserId = userId;
            await _savingsGoalRepository.AddAsync(model);
        }
        else
        {
            var existing = await _savingsGoalRepository.GetByIdAsync(model.Id);
            if (existing == null || existing.UserId != userId)
            {
                return (false, "Savings goal not found.", null);
            }

            // 3. Nếu sửa mà tăng thêm tiền vào mục tiêu thì kiểm tra phần tiền tăng thêm
            var additionalAmount = model.CurrentAmount - existing.CurrentAmount;
            if (additionalAmount > 0 && spendableBalance < additionalAmount)
            {
                return (false, "Insufficient spendable balance to increase savings amount.", null);
            }

            existing.Title = model.Title;
            existing.TargetAmount = model.TargetAmount;
            existing.TargetDate = model.TargetDate;
            existing.CurrentAmount = model.CurrentAmount;
            _savingsGoalRepository.Update(existing);
            model = existing;
        }

        await _savingsGoalRepository.SaveChangesAsync();
        return (true, null, model);
    }

    public async Task<(bool Success, string? ErrorMessage)> DeleteGoalAsync(int userId, int id)
    {
        var goal = await _savingsGoalRepository.GetByIdAsync(id);
        if (goal == null || goal.UserId != userId)
        {
            return (false, "Savings goal not found.");
        }

        _savingsGoalRepository.Delete(goal);
        await _savingsGoalRepository.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage, SavingsGoal? Goal)> FundGoalAsync(int userId, int id, decimal amount, string type)
    {
        if (amount <= 0 || (type != "deposit" && type != "withdraw"))
        {
            return (false, "Invalid input values.", null);
        }

        var goal = await _savingsGoalRepository.GetByIdAsync(id);
        if (goal == null || goal.UserId != userId)
        {
            return (false, "Savings goal not found.", null);
        }

        if (type == "deposit")
        {
            // Check if spendable balance is sufficient
            var (income, expense) = await _transactionRepository.GetIncomeAndExpenseTotalsAsync(userId);
            var savings = await _savingsGoalRepository.GetTotalSavingsAsync(userId);
            var spendableBalance = income - expense - savings;

            if (spendableBalance < amount)
            {
                return (false, "Insufficient spendable balance to save for this goal.", null);
            }

            goal.CurrentAmount += amount;
        }
        else // withdraw
        {
            if (goal.CurrentAmount < amount)
            {
                return (false, "Cannot withdraw more than current savings goal balance.", null);
            }

            goal.CurrentAmount -= amount;
        }

        _savingsGoalRepository.Update(goal);
        await _savingsGoalRepository.SaveChangesAsync();
        return (true, null, goal);
    }
}
