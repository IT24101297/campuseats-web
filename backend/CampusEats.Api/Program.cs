using CampusEats.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// PostgreSQL database connection
builder.Services.AddDbContext<CampusEatsDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default")
    );
});

// Allow the React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
            "https://campuseats-web-teal.vercel.app",
            "http://localhost:5173",
            "http://localhost:4173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("Frontend");

// Idempotent sample data seeding in Development or when explicitly requested via --seed
if (app.Environment.IsDevelopment() || args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<CampusEatsDbContext>();
    await DbInitializer.SeedAsync(db);
}

app.MapGet("/", () => "CampusEats API is running!");

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy"
}));

app.MapControllers();

app.Run();
