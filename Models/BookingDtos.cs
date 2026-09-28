using System.ComponentModel.DataAnnotations;

namespace HotelManagementApi.Models
{
    public class CreateBookingRequest
    {
        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int RoomId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        [Range(1, 20)]
        public int NumberOfGuests { get; set; } = 1;

        public string? SpecialRequests { get; set; }
    }

    public class UpdateBookingStatusRequest
    {
        [Required]
        public string BookingStatus { get; set; } = "Confirmed";
    }

    public class OccupiedRoomDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public int Capacity { get; set; }
        public string ImageName { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string BookingStatus { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalRooms { get; set; }
        public int AvailableRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int TotalBookings { get; set; }
        public int TotalCustomers { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<Booking> RecentBookings { get; set; } = new();
    }
}
