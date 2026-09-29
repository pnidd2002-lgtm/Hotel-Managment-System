import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getRoomImage } from '../assets/images';

export default function MyBookingsView({ user, onExploreRooms }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadMyBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getBookings(user.customerId);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyBookings();
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(bookingId);
      setMsg(`Booking #${bookingId} has been successfully cancelled.`);
      setTimeout(() => setMsg(''), 4000);
      loadMyBookings();
    } catch (err) {
      alert(err.message || 'Cancellation failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <span className="p-2 bg-success bg-opacity-10 text-success rounded-3">
              <i className="bi bi-calendar2-check-fill"></i>
            </span>
            My Hotel Reservations
          </h3>
          <p className="text-muted small mb-0">
            Bookings made by <strong>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>
        <button className="btn btn-warning btn-sm fw-bold shadow-sm" onClick={onExploreRooms}>
          <i className="bi bi-plus-lg me-1"></i> Book Another Room
        </button>
      </div>

      {msg && (
        <div className="alert alert-info py-2 small d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-info-circle-fill"></i>
          <div>{msg}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-2 text-muted small">Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 bg-light">
          <div className="card-body">
            <i className="bi bi-calendar-x text-muted fs-1 mb-3"></i>
            <h5 className="fw-bold text-dark">No Reservations Found</h5>
            <p className="text-muted small mb-3">
              You haven't made any room reservations yet. Explore our luxury rooms and book your getaway!
            </p>
            <button className="btn btn-warning fw-bold px-4 shadow-sm" onClick={onExploreRooms}>
              Explore Rooms Now
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((b) => (
            <div key={b.bookingId} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <img 
                  src={getRoomImage(b.imageName)} 
                  alt={b.roomType}
                  className="card-img-top"
                  style={{ height: '170px', objectFit: 'cover' }}
                />
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-dark me-1">Room #{b.roomNumber}</span>
                      <h5 className="card-title fw-bold text-dark mb-0 mt-1">{b.roomType}</h5>
                    </div>
                    <span className={`badge ${
                      b.bookingStatus === 'Confirmed' ? 'bg-primary' :
                      b.bookingStatus === 'Checked-In' ? 'bg-success' :
                      b.bookingStatus === 'Completed' ? 'bg-secondary' : 'bg-danger'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-light border small my-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Booking Reference:</span>
                      <span className="fw-bold">#{b.bookingId}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Stay Dates:</span>
                      <span className="fw-semibold">{b.checkInDate} to {b.checkOutDate}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Guests:</span>
                      <span>{b.numberOfGuests}</span>
                    </div>
                    <div className="d-flex justify-content-between border-top pt-1 mt-1 text-primary fw-bold">
                      <span>Total Paid:</span>
                      <span className="fs-6">${b.totalAmount}</span>
                    </div>
                  </div>

                  {b.specialRequests && (
                    <div className="small text-muted mb-3 fst-italic">
                      "{b.specialRequests}"
                    </div>
                  )}

                  {b.bookingStatus === 'Confirmed' && (
                    <button 
                      className="btn btn-outline-danger btn-sm w-100 mt-2"
                      onClick={() => handleCancel(b.bookingId)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
