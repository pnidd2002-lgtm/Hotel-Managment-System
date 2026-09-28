using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementApi.Data;
using HotelManagementApi.Models;

namespace HotelManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public RoomsController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/rooms?checkIn=yyyy-MM-dd&checkOut=yyyy-MM-dd&roomType=...
        [HttpGet]
        public async Task<IActionResult> GetRooms([FromQuery] DateTime? checkIn, [FromQuery] DateTime? checkOut, [FromQuery] string? roomType)
        {
            var query = _context.Rooms.AsQueryable();

            if (!string.IsNullOrWhiteSpace(roomType))
            {
                query = query.Where(r => r.RoomType.ToLower().Contains(roomType.ToLower()));
            }

            var rooms = await query.ToListAsync();

            // If check-in and check-out are passed, determine occupied/available status for each room
            if (checkIn.HasValue && checkOut.HasValue)
            {
                var cin = checkIn.Value.Date;
                var cout = checkOut.Value.Date;

                // Active bookings that overlap with requested range
                var conflictingBookings = await _context.Bookings
                    .Where(b => b.BookingStatus == "Confirmed" || b.BookingStatus == "Checked-In")
                    .Where(b => b.CheckInDate < cout && b.CheckOutDate > cin)
                    .Select(b => b.RoomId)
                    .Distinct()
                    .ToListAsync();

                var results = rooms.Select(r => new
                {
                    r.RoomId,
                    r.RoomNumber,
                    r.RoomType,
                    r.PricePerNight,
                    r.Capacity,
                    r.Description,
                    r.Amenities,
                    r.ImageName,
                    // If conflicts, status is Occupied for these dates, otherwise keep room status
                    DisplayStatus = conflictingBookings.Contains(r.RoomId) ? "Occupied" : r.Status,
                    IsAvailable = !conflictingBookings.Contains(r.RoomId) && r.Status == "Available"
                });

                return Ok(results);
            }

            // By default, check today's occupancy
            var today = DateTime.UtcNow.Date;
            var todayOccupiedRoomIds = await _context.Bookings
                .Where(b => (b.BookingStatus == "Confirmed" || b.BookingStatus == "Checked-In") &&
                            b.CheckInDate <= today && b.CheckOutDate > today)
                .Select(b => b.RoomId)
                .Distinct()
                .ToListAsync();

            var defaultResults = rooms.Select(r => new
            {
                r.RoomId,
                r.RoomNumber,
                r.RoomType,
                r.PricePerNight,
                r.Capacity,
                r.Description,
                r.Amenities,
                r.ImageName,
                DisplayStatus = todayOccupiedRoomIds.Contains(r.RoomId) ? "Occupied" : r.Status,
                IsAvailable = !todayOccupiedRoomIds.Contains(r.RoomId) && r.Status == "Available"
            });

            return Ok(defaultResults);
        }

        // GET: api/rooms/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound(new { message = "Room not found." });

            return Ok(room);
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<IActionResult> AddRoom([FromBody] Room room)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.Rooms.AnyAsync(r => r.RoomNumber == room.RoomNumber);
            if (exists)
                return Conflict(new { message = $"Room number {room.RoomNumber} already exists." });

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoom), new { id = room.RoomId }, room);
        }

        // PUT: api/rooms/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] Room room)
        {
            if (id != room.RoomId)
                return BadRequest(new { message = "ID mismatch." });

            var existing = await _context.Rooms.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Room not found." });

            existing.RoomNumber = room.RoomNumber;
            existing.RoomType = room.RoomType;
            existing.PricePerNight = room.PricePerNight;
            existing.Capacity = room.Capacity;
            existing.Status = room.Status;
            existing.Description = room.Description;
            existing.Amenities = room.Amenities;
            existing.ImageName = string.IsNullOrWhiteSpace(room.ImageName) ? existing.ImageName : room.ImageName;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/rooms/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound(new { message = "Room not found." });

            var hasActiveBookings = await _context.Bookings
                .AnyAsync(b => b.RoomId == id && (b.BookingStatus == "Confirmed" || b.BookingStatus == "Checked-In"));

            if (hasActiveBookings)
            {
                return BadRequest(new { message = "Cannot delete room with active bookings. Cancel or complete bookings first." });
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Room removed successfully." });
        }
    }
}
