using Microsoft.EntityFrameworkCore;
using HotelManagementApi.Models;

namespace HotelManagementApi.Data
{
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Customer
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.ToTable("Customers");
                entity.HasKey(e => e.CustomerId);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure Room
            modelBuilder.Entity<Room>(entity =>
            {
                entity.ToTable("Rooms");
                entity.HasKey(e => e.RoomId);
                entity.HasIndex(e => e.RoomNumber).IsUnique();
            });

            // Configure Booking
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.ToTable("Bookings");
                entity.HasKey(e => e.BookingId);

                entity.HasOne(d => d.Customer)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Room)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.RoomId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
