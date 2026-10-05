using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Services.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PersonalFinanceTracker.Controllers;

[Authorize]
[ApiController]
public class CategoriesApiController : Controller
{
    private readonly ICategoryService _categoryService;

    public CategoriesApiController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // 1. Get Categories
    [HttpGet]
    [Route("api/finance/categories")]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _categoryService.GetCategoriesAsync(CurrentUserId);
            return Json(categories);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // 2. Save Category (Add/Edit)
    [HttpPost]
    [Route("api/finance/categories")]
    public async Task<IActionResult> SaveCategory([FromBody] Category model)
    {
        try
        {
            var result = await _categoryService.SaveCategoryAsync(model, CurrentUserId);
            if (!result.Success)
            {
                if (result.ErrorMessage == "Category not found.")
                {
                    return NotFound();
                }
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Json(new { success = true, data = result.Category });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // 3. Delete Category
    [HttpDelete]
    [Route("api/finance/categories/{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var result = await _categoryService.DeleteCategoryAsync(id, CurrentUserId);
            if (!result.Success)
            {
                if (result.ErrorMessage == "Category not found.")
                {
                    return NotFound();
                }
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
