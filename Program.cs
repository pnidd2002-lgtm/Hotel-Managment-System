using Microsoft.EntityFrameworkCore;
using HotelManagementApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add MySQL DbContext using Oracle MySql.EntityFrameworkCore (no Pomelo)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<HotelDbContext>(options =>
{
    options.UseMySQL(connectionString!);
});

// 2. Add Controllers
builder.Services.AddControllers();

// 3. Add CORS for Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Add OpenAPI documentation
builder.Services.AddOpenApi();

var app = builder.Build();

// Enable Swagger / OpenAPI
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
