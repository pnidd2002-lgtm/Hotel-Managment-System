using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementApi.Data;
using HotelManagementApi.Models;

namespace HotelManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public BookingsController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings?customerId=...
        [HttpGet]
        public async Task<IActionResult> GetBookings([FromQuery] int? customerId)
        {
            var query = _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .AsQueryable();

            if (customerId.HasValue && customerId.Value > 0)
            {
                query = query.Where(b => b.CustomerId == customerId.Value);
            }

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new
                {
                    b.BookingId,
                    b.CustomerId,
                    CustomerName = b.Customer != null ? b.Customer.FullName : "Unknown",
                    CustomerEmail = b.Customer != null ? b.Customer.Email : "",
                    CustomerPhone = b.Customer != null ? b.Customer.Phone : "",
                    b.RoomId,
                    RoomNumber = b.Room != null ? b.Room.RoomNumber : "N/A",
                    RoomType = b.Room != null ? b.Room.RoomType : "N/A",
                    PricePerNight = b.Room != null ? b.Room.PricePerNight : 0,
                    ImageName = b.Room != null ? b.Room.ImageName : "",
                    CheckInDate = b.CheckInDate.ToString("yyyy-MM-dd"),
                    CheckOutDate = b.CheckOutDate.ToString("yyyy-MM-dd"),
                    b.NumberOfGuests,
                    b.TotalAmount,
                    b.BookingStatus,
                    b.SpecialRequests,
                    b.CreatedAt
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/bookings/occupied-rooms?targetDate=yyyy-MM-dd
        [HttpGet("occupied-rooms")]
        public async Task<IActionResult> GetOccupiedRooms([FromQuery] DateTime? targetDate)
        {
            var queryDate = targetDate?.Date ?? DateTime.UtcNow.Date;

            // Find all active bookings that cover queryDate
            var occupiedBookings = await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Customer)
                .Where(b => (b.BookingStatus == "Confirmed" || b.BookingStatus == "Checked-In") &&
                            b.CheckInDate <= queryDate && b.CheckOutDate > queryDate)
                .Select(b => new OccupiedRoomDto
                {
                    RoomId = b.RoomId,
                    RoomNumber = b.Room != null ? b.Room.RoomNumber : "",
                    RoomType = b.Room != null ? b.Room.RoomType : "",
                    PricePerNight = b.Room != null ? b.Room.PricePerNight : 0,
                    Capacity = b.Room != null ? b.Room.Capacity : 0,
                    ImageName = b.Room != null ? b.Room.ImageName : "",
                    BookingId = b.BookingId,
                    CustomerId = b.CustomerId,
                    CustomerName = b.Customer != null ? b.Customer.FullName : "Guest",
                    CustomerEmail = b.Customer != null ? b.Customer.Email : "",
                    CustomerPhone = b.Customer != null ? b.Customer.Phone : "",
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    BookingStatus = b.BookingStatus,
                    TotalAmount = b.TotalAmount
                })
                .ToListAsync();

            return Ok(new
            {
                TargetDate = queryDate.ToString("yyyy-MM-dd"),
                Count = occupiedBookings.Count,
                OccupiedRooms = occupiedBookings
            });
        }

        // POST: api/bookings (With DOUBLE BOOKING PREVENTION)
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var checkIn = request.CheckInDate.Date;
            var checkOut = request.CheckOutDate.Date;

            if (checkIn >= checkOut)
            {
                return BadRequest(new { message = "Check-out date must be after check-in date." });
            }

            var room = await _context.Rooms.FindAsync(request.RoomId);
            if (room == null)
            {
                return NotFound(new { message = "Selected room does not exist." });
            }

            var customer = await _context.Customers.FindAsync(request.CustomerId);
            if (customer == null)
            {
                return NotFound(new { message = "Customer record not found." });
            }

            // =========================================================================
            // MANDATORY FEATURE: PREVENT DOUBLE BOOKING
            // Overlap logic: (ExistingCheckIn < RequestedCheckOut) AND (ExistingCheckOut > RequestedCheckIn)
            // =========================================================================
            var conflictingBooking = await _context.Bookings
                .Include(b => b.Customer)
                .Where(b => b.RoomId == request.RoomId &&
                           (b.BookingStatus == "Confirmed" || b.BookingStatus == "Checked-In") &&
                            b.CheckInDate < checkOut &&
                            b.CheckOutDate > checkIn)
                .FirstOrDefaultAsync();

            if (conflictingBooking != null)
            {
                return Conflict(new
                {
                    message = $"DOUBLE BOOKING PREVENTED: Room {room.RoomNumber} ({room.RoomType}) is already booked from {conflictingBooking.CheckInDate:yyyy-MM-dd} to {conflictingBooking.CheckOutDate:yyyy-MM-dd} by customer {conflictingBooking.Customer?.FullName ?? "another guest"}.",
                    conflictBookingId = conflictingBooking.BookingId,
                    bookedFrom = conflictingBooking.CheckInDate.ToString("yyyy-MM-dd"),
                    bookedTo = conflictingBooking.CheckOutDate.ToString("yyyy-MM-dd")
                });
            }

            // Calculate total amount = (nights) * price per night
            int nights = (checkOut - checkIn).Days;
            if (nights <= 0) nights = 1;
            decimal totalAmount = nights * room.PricePerNight;

            var newBooking = new Booking
            {
                CustomerId = request.CustomerId,
                RoomId = request.RoomId,
                CheckInDate = checkIn,
                CheckOutDate = checkOut,
                NumberOfGuests = request.NumberOfGuests,
                TotalAmount = totalAmount,
                BookingStatus = "Confirmed",
                SpecialRequests = request.SpecialRequests?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(newBooking);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking created successfully!",
                bookingId = newBooking.BookingId,
                roomNumber = room.RoomNumber,
                roomType = room.RoomType,
                totalAmount = newBooking.TotalAmount,
                checkInDate = newBooking.CheckInDate.ToString("yyyy-MM-dd"),
                checkOutDate = newBooking.CheckOutDate.ToString("yyyy-MM-dd")
            });
        }

        // PUT: api/bookings/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusRequest request)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            booking.BookingStatus = request.BookingStatus;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Booking #{id} status updated to {booking.BookingStatus}." });
        }

        // DELETE: api/bookings/{id} (Cancel booking)
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            booking.BookingStatus = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Booking #{id} has been cancelled." });
        }
    }
}
