using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementApi.Data;
using HotelManagementApi.Models;

namespace HotelManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public DashboardController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/dashboard/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var today = DateTime.UtcNow.Date;

            var totalRooms = await _context.Rooms.CountAsync();

            var currentlyOccupiedRoomIds = await _context.Bookings
                .Where(b => (b.BookingStatus == "Confirmed" || b.BookingStatus == "Checked-In") &&
                            b.CheckInDate <= today && b.CheckOutDate > today)
                .Select(b => b.RoomId)
                .Distinct()
                .ToListAsync();

            var occupiedRoomsCount = currentlyOccupiedRoomIds.Count;
            var availableRoomsCount = totalRooms - occupiedRoomsCount;

            var totalBookings = await _context.Bookings.CountAsync();
            var totalCustomers = await _context.Customers.CountAsync(c => c.Role == "Customer");

            var totalRevenue = await _context.Bookings
                .Where(b => b.BookingStatus != "Cancelled")
                .SumAsync(b => b.TotalAmount);

            var recentBookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .OrderByDescending(b => b.CreatedAt)
                .Take(5)
                .Select(b => new
                {
                    b.BookingId,
                    CustomerName = b.Customer != null ? b.Customer.FullName : "Guest",
                    RoomNumber = b.Room != null ? b.Room.RoomNumber : "N/A",
                    RoomType = b.Room != null ? b.Room.RoomType : "N/A",
                    CheckInDate = b.CheckInDate.ToString("yyyy-MM-dd"),
                    CheckOutDate = b.CheckOutDate.ToString("yyyy-MM-dd"),
                    b.TotalAmount,
                    b.BookingStatus
                })
                .ToListAsync();

            return Ok(new
            {
                TotalRooms = totalRooms,
                AvailableRooms = availableRoomsCount,
                OccupiedRooms = occupiedRoomsCount,
                TotalBookings = totalBookings,
                TotalCustomers = totalCustomers,
                TotalRevenue = totalRevenue,
                RecentBookings = recentBookings
            });
        }
    }
}
