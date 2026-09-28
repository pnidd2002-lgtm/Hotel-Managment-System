using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementApi.Data;
using HotelManagementApi.Models;

namespace HotelManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public AuthController(HotelDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Customers
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || user.Password != request.Password)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(new AuthResponse
            {
                CustomerId = user.CustomerId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role
            });
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _context.Customers
                .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existingUser)
            {
                return Conflict(new { message = "An account with this email already exists." });
            }

            var newUser = new Customer
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                Password = request.Password, // Demo requirement: plain text, no hashing
                Phone = request.Phone.Trim(),
                Address = request.Address?.Trim(),
                Role = string.IsNullOrWhiteSpace(request.Role) ? "Customer" : request.Role.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                CustomerId = newUser.CustomerId,
                FullName = newUser.FullName,
                Email = newUser.Email,
                Phone = newUser.Phone,
                Address = newUser.Address,
                Role = newUser.Role
            });
        }

        // GET: api/auth/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _context.Customers
                .OrderBy(c => c.CustomerId)
                .Select(c => new AuthResponse
                {
                    CustomerId = c.CustomerId,
                    FullName = c.FullName,
                    Email = c.Email,
                    Phone = c.Phone,
                    Address = c.Address,
                    Role = c.Role
                })
                .ToListAsync();

            return Ok(customers);
        }

        // PUT: api/auth/profile/{id}
        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] Customer updated)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { message = "Customer not found." });

            customer.FullName = updated.FullName;
            customer.Phone = updated.Phone;
            customer.Address = updated.Address;

            if (!string.IsNullOrWhiteSpace(updated.Password))
            {
                customer.Password = updated.Password;
            }

            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                CustomerId = customer.CustomerId,
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone,
                Address = customer.Address,
                Role = customer.Role
            });
        }
    }
}
