using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HotelManagementApi.Models
{
    [Table("Rooms")]
    public class Room
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoomId { get; set; }

        [Required]
        [MaxLength(20)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string RoomType { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerNight { get; set; }

        public int Capacity { get; set; } = 2;

        [MaxLength(30)]
        public string Status { get; set; } = "Available"; // Available, Maintenance

        public string? Description { get; set; }

        [MaxLength(255)]
        public string Amenities { get; set; } = "WiFi, AC, TV";

        [MaxLength(100)]
        public string ImageName { get; set; } = "room_standard.jpg";

        [JsonIgnore]
        public ICollection<Booking>? Bookings { get; set; }
    }
}
