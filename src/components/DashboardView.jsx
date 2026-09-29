import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DashboardView({ user, onNavigateToOccupied }) {
  const [stats, setStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings()
      ]);
      setStats(statsData);
      setAllBookings(bookingsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      setActionMsg(`Booking #${bookingId} status changed to ${newStatus}`);
      setTimeout(() => setActionMsg(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Loading hotel management analytics...</p>
      </div>
    );
  }

  const occupancyRate = stats && stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) 
    : 0;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-2">
        <div>
          <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <span className="p-2 bg-warning bg-opacity-25 text-warning-emphasis rounded-3">
              <i className="bi bi-graph-up-arrow"></i>
            </span>
            Hotel Administration & Operations Dashboard
          </h3>
          <p className="text-muted small mb-0">
            Real-time management metrics, occupancy analysis, and customer reservation logs.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button className="btn btn-danger btn-sm fw-semibold shadow-sm" onClick={onNavigateToOccupied}>
            <i className="bi bi-door-closed-fill me-1"></i> View Occupied Rooms
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 small" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {actionMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
            <div className="d-flex justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase">Total Rooms</small>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats?.totalRooms ?? 0}</h3>
                <small className="text-muted">In hotel inventory</small>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 h-50">
                <i className="bi bi-buildings fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-danger">
            <div className="d-flex justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase">Occupied Rooms</small>
                <h3 className="fw-bold text-danger mb-0 mt-1">{stats?.occupiedRooms ?? 0}</h3>
                <small className="text-danger fw-semibold">{occupancyRate}% Occupancy Rate</small>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 h-50">
                <i className="bi bi-person-slash fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <div className="d-flex justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase">Available Rooms</small>
                <h3 className="fw-bold text-success mb-0 mt-1">{stats?.availableRooms ?? 0}</h3>
                <small className="text-muted">Ready for booking</small>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 h-50">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-warning">
            <div className="d-flex justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase">Total Revenue</small>
                <h3 className="fw-bold text-dark mb-0 mt-1">${stats?.totalRevenue?.toFixed(2) ?? '0.00'}</h3>
                <small className="text-muted">{stats?.totalBookings ?? 0} total bookings</small>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning-emphasis rounded-3 h-50">
                <i className="bi bi-currency-dollar fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="d-flex justify-content-between small fw-semibold mb-2">
          <span>Hotel Occupancy Status</span>
          <span className="text-danger fw-bold">{stats?.occupiedRooms} Occupied / {stats?.totalRooms} Total Rooms ({occupancyRate}%)</span>
        </div>
        <div className="progress" style={{ height: '12px' }}>
          <div 
            className="progress-bar bg-danger" 
            role="progressbar" 
            style={{ width: `${occupancyRate}%` }}
          ></div>
          <div 
            className="progress-bar bg-success" 
            role="progressbar" 
            style={{ width: `${100 - occupancyRate}%` }}
          ></div>
        </div>
      </div>

      {/* All Reservations Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold fs-6">
            <i className="bi bi-table me-2 text-warning"></i>
            All Customer Reservations ({allBookings.length})
          </h5>
          <span className="badge bg-secondary text-white">Full Database Log</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Booking #</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-end">Manage Action</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                allBookings.map((b) => (
                  <tr key={b.bookingId}>
                    <td className="fw-semibold">#{b.bookingId}</td>
                    <td>
                      <div className="fw-bold text-dark">{b.customerName}</div>
                      <small className="text-muted">{b.customerEmail}</small>
                    </td>
                    <td>
                      <span className="badge bg-dark me-1">#{b.roomNumber}</span>
                      <small className="fw-semibold">{b.roomType}</small>
                    </td>
                    <td>{b.checkInDate}</td>
                    <td>{b.checkOutDate}</td>
                    <td className="fw-bold text-primary">${b.totalAmount}</td>
                    <td>
                      <span className={`badge ${
                        b.bookingStatus === 'Confirmed' ? 'bg-primary' :
                        b.bookingStatus === 'Checked-In' ? 'bg-success' :
                        b.bookingStatus === 'Completed' ? 'bg-secondary' : 'bg-danger'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {b.bookingStatus === 'Confirmed' && (
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => handleStatusChange(b.bookingId, 'Checked-In')}
                            title="Check-In Guest"
                          >
                            <i className="bi bi-door-open-fill"></i> Check-In
                          </button>
                        )}
                        {b.bookingStatus === 'Checked-In' && (
                          <button 
                            className="btn btn-outline-info text-dark"
                            onClick={() => handleStatusChange(b.bookingId, 'Completed')}
                            title="Complete Checkout"
                          >
                            <i className="bi bi-check2-circle"></i> Check-Out
                          </button>
                        )}
                        {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleStatusChange(b.bookingId, 'Cancelled')}
                            title="Cancel Booking"
                          >
                            <i className="bi bi-x-circle"></i> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
