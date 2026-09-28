using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagementApi.Models
{
    [Table("Bookings")]
    public class Booking
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookingId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer? Customer { get; set; }

        [Required]
        public int RoomId { get; set; }

        [ForeignKey("RoomId")]
        public Room? Room { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime CheckInDate { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime CheckOutDate { get; set; }

        public int NumberOfGuests { get; set; } = 1;

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(30)]
        public string BookingStatus { get; set; } = "Confirmed"; // Confirmed, Checked-In, Completed, Cancelled

        public string? SpecialRequests { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
