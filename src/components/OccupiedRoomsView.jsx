import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getRoomImage } from '../assets/images';

export default function OccupiedRoomsView({ user, onRefreshRooms }) {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [occupiedData, setOccupiedData] = useState({ occupiedRooms: [], count: 0, targetDate: '' });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchOccupied = async (date) => {
    setLoading(true);
    try {
      const data = await api.getOccupiedRooms(date);
      setOccupiedData(data);
    } catch (err) {
      console.error('Failed to load occupied rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupied(targetDate);
  }, [targetDate]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      setStatusMessage(`Booking #${bookingId} updated to ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 4000);
      fetchOccupied(targetDate);
      if (onRefreshRooms) onRefreshRooms();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <span className="p-2 bg-danger bg-opacity-10 text-danger rounded-3">
              <i className="bi bi-door-closed-fill"></i>
            </span>
            Occupied Rooms Tracker
          </h3>
          <p className="text-muted small mb-0">
            Real-time status of rooms currently occupied by guests or reserved for selected dates.
          </p>
        </div>

        {/* Date Filter */}
        <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 shadow-sm border">
          <label className="small fw-bold text-secondary mb-0">Check Date:</label>
          <input 
            type="date" 
            className="form-control form-control-sm"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
            title="Reset to Today"
          >
            Today
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="alert alert-success alert-dismissible fade show py-2 small" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {statusMessage}
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-danger text-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="small text-uppercase opacity-75 fw-semibold">Occupied Rooms</div>
                <div className="fs-2 fw-bold">{occupiedData.count}</div>
              </div>
              <i className="bi bi-person-slash fs-1 opacity-50"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-dark text-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="small text-uppercase opacity-75 fw-semibold">Selected Target Date</div>
                <div className="fs-5 fw-bold">{targetDate}</div>
              </div>
              <i className="bi bi-calendar-event fs-1 opacity-50"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-light border p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="small text-uppercase text-muted fw-semibold">Front Desk Status</div>
                <div className="fs-6 fw-bold text-success">
                  <i className="bi bi-check-circle-fill me-1"></i> Live Double Booking Protected
                </div>
              </div>
              <i className="bi bi-shield-check fs-1 text-success opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Occupied Rooms Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <p className="mt-2 text-muted small">Loading occupancy data...</p>
        </div>
      ) : occupiedData.occupiedRooms.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 bg-light">
          <div className="card-body">
            <i className="bi bi-house-check text-success fs-1 mb-3"></i>
            <h5 className="fw-bold text-dark">No Occupied Rooms On {targetDate}</h5>
            <p className="text-muted small mb-0">
              All hotel rooms are vacant and ready for new guest reservations on this date.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {occupiedData.occupiedRooms.map((occ) => {
            const cin = new Date(occ.checkInDate).toLocaleDateString();
            const cout = new Date(occ.checkOutDate).toLocaleDateString();

            return (
              <div key={occ.bookingId} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                  {/* Occupied Badge */}
                  <span className="position-absolute top-0 end-0 m-3 badge bg-danger shadow-sm px-3 py-2 fs-6">
                    <i className="bi bi-lock-fill me-1"></i> OCCUPIED
                  </span>

                  <img 
                    src={getRoomImage(occ.imageName)} 
                    alt={occ.roomType}
                    className="card-img-top"
                    style={{ height: '190px', objectFit: 'cover' }}
                  />

                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-dark me-1">Room #{occ.roomNumber}</span>
                        <h5 className="card-title fw-bold text-dark mb-0 mt-1">{occ.roomType}</h5>
                      </div>
                      <div className="text-end">
                        <span className="fw-bold text-primary">${occ.pricePerNight}</span>
                        <small className="text-muted d-block">/ night</small>
                      </div>
                    </div>

                    <hr className="my-3 opacity-25" />

                    {/* Guest Information */}
                    <div className="bg-light p-3 rounded-3 small mb-3">
                      <div className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.7rem' }}>
                        Guest Occupancy Info
                      </div>
                      <div className="mb-1 text-dark">
                        <i className="bi bi-person-fill text-danger me-2"></i>
                        <strong>{occ.customerName}</strong>
                      </div>
                      <div className="mb-1 text-secondary">
                        <i className="bi bi-envelope text-muted me-2"></i>
                        {occ.customerEmail}
                      </div>
                      <div className="text-secondary">
                        <i className="bi bi-telephone text-muted me-2"></i>
                        {occ.customerPhone}
                      </div>
                    </div>

                    {/* Reservation Dates */}
                    <div className="d-flex justify-content-between p-2 rounded bg-warning bg-opacity-10 border border-warning small mb-3">
                      <div>
                        <small className="text-muted d-block">Check-In</small>
                        <strong className="text-dark">{cin}</strong>
                      </div>
                      <div className="text-center pt-2 text-muted">
                        <i className="bi bi-arrow-right"></i>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Check-Out</small>
                        <strong className="text-dark">{cout}</strong>
                      </div>
                    </div>

                    {/* Quick Staff Controls */}
                    {user && (user.role === 'Admin' || user.role === 'Receptionist') && (
                      <div className="d-flex gap-2">
                        {occ.bookingStatus === 'Confirmed' && (
                          <button 
                            className="btn btn-sm btn-success flex-grow-1 fw-semibold"
                            onClick={() => handleStatusChange(occ.bookingId, 'Checked-In')}
                          >
                            <i className="bi bi-door-open-fill me-1"></i> Check In
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-danger flex-grow-1"
                          onClick={() => handleStatusChange(occ.bookingId, 'Completed')}
                          title="Free up room"
                        >
                          <i className="bi bi-check2-circle me-1"></i> Check Out
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
