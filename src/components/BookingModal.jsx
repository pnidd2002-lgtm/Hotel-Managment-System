import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getRoomImage } from '../assets/images';

export default function BookingModal({ room, user, show, onClose, onBookingSuccess, initialCheckIn, initialCheckOut }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(initialCheckIn || tomorrowStr);
  const [checkOut, setCheckOut] = useState(initialCheckOut || dayAfterStr);
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doubleBookingAlert, setDoubleBookingAlert] = useState(null);

  useEffect(() => {
    if (initialCheckIn) setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
    setError('');
    setDoubleBookingAlert(null);
  }, [room, initialCheckIn, initialCheckOut]);

  if (!show || !room) return null;

  // Calculate nights & total
  const cinDate = new Date(checkIn);
  const coutDate = new Date(checkOut);
  const diffTime = coutDate - cinDate;
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = nights * room.pricePerNight;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDoubleBookingAlert(null);

    if (cinDate >= coutDate) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createBooking({
        customerId: user ? user.customerId : 2, // John Doe as fallback if demo guest
        roomId: room.roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: parseInt(guests),
        specialRequests
      });

      onBookingSuccess(res);
      onClose();
    } catch (err) {
      const msg = err.message || 'Booking failed';
      if (msg.includes('DOUBLE BOOKING PREVENTED') || msg.toLowerCase().includes('already booked')) {
        setDoubleBookingAlert(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-calendar-check-fill text-warning"></i>
              Book Room {room.roomNumber} - {room.roomType}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Room details preview */}
              <div className="col-md-5">
                <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-light">
                  <img 
                    src={getRoomImage(room.imageName)} 
                    alt={room.roomType}
                    className="card-img-top"
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <div className="card-body p-3">
                    <h6 className="card-title fw-bold text-dark mb-1">{room.roomType}</h6>
                    <div className="text-muted small mb-2">Room #{room.roomNumber} • Max {room.capacity} Guests</div>
                    
                    <p className="card-text small text-secondary mb-3">
                      {room.description}
                    </p>

                    <div className="p-2 bg-white rounded border small">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Rate:</span>
                        <span className="fw-semibold">${room.pricePerNight} / night</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Duration:</span>
                        <span className="fw-semibold">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-1 mt-1 text-primary fw-bold">
                        <span>Estimated Total:</span>
                        <span className="fs-6">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="col-md-7">
                {/* DOUBLE BOOKING PREVENTED ALERT */}
                {doubleBookingAlert && (
                  <div className="alert alert-danger shadow-sm border-danger border-2 p-3 rounded-3 mb-3">
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-shield-fill-x text-danger fs-3"></i>
                      <div>
                        <h6 className="fw-bold text-danger mb-1">Double Booking Conflict Prevented!</h6>
                        <p className="small mb-2 text-dark">
                          {doubleBookingAlert}
                        </p>
                        <small className="text-muted">
                          💡 Please choose different dates or select another available room.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Customer / Guest</label>
                    <div className="p-2 rounded bg-light border small text-dark d-flex align-items-center justify-content-between">
                      <div>
                        <i className="bi bi-person-circle me-1 text-primary"></i>
                        <strong>{user ? user.fullName : 'Guest (John Doe Demo)'}</strong>
                        <span className="text-muted ms-2">({user ? user.email : 'john.doe@example.com'})</span>
                      </div>
                      <span className="badge bg-secondary">{user ? user.role : 'Guest'}</span>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Check-In Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        required 
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Check-Out Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        required 
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Number of Guests</label>
                    <select 
                      className="form-select"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'} (Max {room.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Special Requests (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      placeholder="e.g. Quiet room, extra towels, late check-in..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button type="button" className="btn btn-outline-secondary px-3" onClick={onClose}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-warning px-4 fw-bold shadow-sm"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Confirm Booking • $${totalAmount.toFixed(2)}`}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
