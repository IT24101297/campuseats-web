
using Microsoft.AspNetCore.Mvc;

namespace CampusEats.Api.Controllers;

[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMenu()
    {
        var menu = new[]
        {
            new { Id = 1, Name = "Chicken Rice", Price = 850 },
            new { Id = 2, Name = "Cheese Kottu", Price = 1200 },
            new { Id = 3, Name = "Vegetable Fried Rice", Price = 700 },
            new { Id = 4, Name = "Chicken Burger", Price = 950 }
        };

        return Ok(menu);
    }
}
