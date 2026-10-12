using CampusEats.Api.Data;
using CampusEats.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CampusEats.Api.Controllers;

[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly CampusEatsDbContext _db;
    private readonly ILogger<MenuController> _logger;

    public MenuController(CampusEatsDbContext db, ILogger<MenuController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<MenuItem>>> GetMenu()
    {
        try
        {
            var items = await _db.MenuItems
                .AsNoTracking()
                .OrderBy(m => m.Id)
                .ToListAsync();

            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve menu items from database.");
            return StatusCode(500, new { message = "Unable to retrieve menu items at this time. Please try again later." });
        }
    }
}
