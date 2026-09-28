using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HotelManagementApi.Models
{
    [Table("Customers")]
    public class Customer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty; // Plain text per demo requirement

        [Required]
        [MaxLength(25)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string Role { get; set; } = "Customer"; // Customer, Receptionist, Admin

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Booking>? Bookings { get; set; }
    }
}
