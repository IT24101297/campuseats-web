using Microsoft.EntityFrameworkCore;
using CampusEats.Api.Models;

namespace CampusEats.Api.Data;

public class CampusEatsDbContext : DbContext
{
    public CampusEatsDbContext(
        DbContextOptions<CampusEatsDbContext> options)
        : base(options)
    {
    }

    public DbSet<MenuItem> MenuItems => Set<MenuItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Name).IsRequired();
            entity.Property(m => m.Price).HasPrecision(10, 2);
        });
    }
}
