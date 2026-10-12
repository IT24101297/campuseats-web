using CampusEats.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusEats.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(CampusEatsDbContext db)
    {
        if (await db.MenuItems.AnyAsync())
        {
            return; // Idempotent: already seeded
        }

        var sampleItems = new[]
        {
            new MenuItem { Name = "Chicken Rice", Price = 850.00m },
            new MenuItem { Name = "Cheese Kottu", Price = 1200.00m },
            new MenuItem { Name = "Vegetable Fried Rice", Price = 700.00m },
            new MenuItem { Name = "Chicken Burger", Price = 950.00m }
        };

        await db.MenuItems.AddRangeAsync(sampleItems);
        await db.SaveChangesAsync();
    }
}
