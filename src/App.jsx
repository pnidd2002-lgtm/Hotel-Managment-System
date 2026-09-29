import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoomCard from './components/RoomCard';
import BookingModal from './components/BookingModal';
import LoginModal from './components/LoginModal';
import OccupiedRoomsView from './components/OccupiedRoomsView';
import DashboardView from './components/DashboardView';
import MyBookingsView from './components/MyBookingsView';
import AdminRoomsView from './components/AdminRoomsView';
import { api } from './services/api';
import { images } from './assets/images';

export default function App() {
  // Current user state (defaults to John Doe for instant demo exploration, or null)
  const [user, setUser] = useState({
    customerId: 2,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Customer',
    phone: '+1 555-0199'
  });

  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms', 'occupied', 'dashboard', 'my-bookings', 'manage-rooms'
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Search / Availability Filter state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const [filterCheckIn, setFilterCheckIn] = useState(todayStr);
  const [filterCheckOut, setFilterCheckOut] = useState(tomorrowStr);
  const [filterType, setFilterType] = useState('');

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Global Notification
  const [toastMsg, setToastMsg] = useState(null);

  // Fetch Rooms
  const fetchRooms = async (cin = filterCheckIn, cout = filterCheckOut, type = filterType) => {
    setLoadingRooms(true);
    try {
      const data = await api.getRooms(cin, cout, type);
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRooms(filterCheckIn, filterCheckOut, filterType);
  };

  const handleResetFilter = () => {
    setFilterCheckIn(todayStr);
    setFilterCheckOut(tomorrowStr);
    setFilterType('');
    fetchRooms(todayStr, tomorrowStr, '');
  };

  // Quick Demo Role Switcher
  const handleQuickSwitch = (role) => {
    if (role === 'Admin') {
      setUser({
        customerId: 1,
        fullName: 'Admin Manager',
        email: 'admin@hotel.com',
        role: 'Admin',
        phone: '+1 555-0100'
      });
      setActiveTab('dashboard');
      showNotification('Switched to Administrator Mode (Admin Manager)', 'danger');
    } else if (role === 'Receptionist') {
      setUser({
        customerId: 4,
        fullName: 'Elena Rostova',
        email: 'reception@hotel.com',
        role: 'Receptionist',
        phone: '+1 555-0155'
      });
      setActiveTab('occupied');
      showNotification('Switched to Receptionist Mode (Elena Rostova)', 'info');
    } else {
      setUser({
        customerId: 2,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Customer',
        phone: '+1 555-0199'
      });
      setActiveTab('rooms');
      showNotification('Switched to Customer Mode (John Doe)', 'success');
    }
  };

  const showNotification = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleBookingClick = (room) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (bookingRes) => {
    showNotification(`Booking confirmed for Room #${bookingRes.roomNumber}! Ref: #${bookingRes.bookingId}`, 'success');
    fetchRooms(filterCheckIn, filterCheckOut, filterType);
    if (user.role === 'Customer') {
      setActiveTab('my-bookings');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Demo Presentation Banner */}
      <div className="bg-dark text-warning border-bottom border-warning py-1 px-3 small d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-mortarboard-fill me-1"></i>
          <strong>ESOFT Uni Faculty of Computing</strong> • Hotel Management System (Demo Presentation)
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark">ASP.NET Core 10 Web API + MySQL + React</span>
          <span className="badge bg-outline-light border text-white">No Pomelo (Oracle MySQL EF Core)</span>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={() => {
          setUser(null);
          setActiveTab('rooms');
          showNotification('You have logged out.');
        }}
        onQuickSwitch={handleQuickSwitch}
      />

      {/* Notification Toast Alert */}
      {toastMsg && (
        <div className="container mt-3">
          <div className={`alert alert-${toastMsg.type} alert-dismissible fade show shadow-sm py-2 px-3 small d-flex align-items-center justify-content-between`} role="alert">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-bell-fill"></i>
              <span>{toastMsg.message}</span>
            </div>
            <button type="button" className="btn-close py-2" onClick={() => setToastMsg(null)}></button>
          </div>
        </div>
      )}

      {/* Main Content Area based on activeTab */}
      <main className="flex-grow-1">
        {activeTab === 'rooms' && (
          <div>
            {/* Hero Section */}
            <div 
              className="position-relative text-white py-5 mb-4 shadow"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url(${images.hero})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '340px'
              }}
            >
              <div className="container py-4 text-center">
                <span className="badge bg-warning text-dark px-3 py-2 text-uppercase fw-bold mb-2 shadow-sm">
                  Luxury • Comfort • Seamless Booking
                </span>
                <h1 className="display-4 fw-bold mb-2">Welcome to Grand Horizon Hotel</h1>
                <p className="lead mx-auto text-light opacity-90 mb-4" style={{ maxWidth: '750px' }}>
                  Experience five-star luxury suites, ocean views, and automated real-time booking with intelligent double-booking prevention.
                </p>

                {/* Date & Room Filter Search Bar */}
                <div className="card shadow-lg border-0 rounded-4 p-3 bg-white text-dark mx-auto" style={{ maxWidth: '900px' }}>
                  <form onSubmit={handleSearch} className="row g-2 align-items-end text-start">
                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted mb-1">
                        <i className="bi bi-calendar-event me-1 text-primary"></i> Check-In Date
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={filterCheckIn}
                        onChange={(e) => setFilterCheckIn(e.target.value)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted mb-1">
                        <i className="bi bi-calendar2-check me-1 text-primary"></i> Check-Out Date
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={filterCheckOut}
                        min={filterCheckIn}
                        onChange={(e) => setFilterCheckOut(e.target.value)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted mb-1">
                        <i className="bi bi-funnel me-1 text-primary"></i> Room Type
                      </label>
                      <select 
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="">All Room Types</option>
                        <option value="Standard">Standard Rooms</option>
                        <option value="Deluxe">Deluxe Rooms</option>
                        <option value="Suite">Suites</option>
                        <option value="Executive">Executive</option>
                        <option value="Presidential">Presidential</option>
                        <option value="Family">Family Villa</option>
                      </select>
                    </div>

                    <div className="col-md-3 d-flex gap-2">
                      <button type="submit" className="btn btn-warning fw-bold flex-grow-1 shadow-sm">
                        <i className="bi bi-search me-1"></i> Check
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={handleResetFilter}
                        title="Reset dates"
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>

            {/* Room List Section */}
            <div className="container py-2 mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Available Rooms & Suites</h3>
                  <p className="text-muted small mb-0">
                    Showing availability for stay: <strong>{filterCheckIn}</strong> to <strong>{filterCheckOut}</strong>
                  </p>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm fw-semibold"
                  onClick={() => setActiveTab('occupied')}
                >
                  <i className="bi bi-person-slash me-1"></i> View Occupied Rooms Only
                </button>
              </div>

              {loadingRooms ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status"></div>
                  <p className="mt-2 text-muted">Checking room inventory and dates...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4">
                  <i className="bi bi-emoji-frown fs-1 text-muted"></i>
                  <h5 className="fw-bold mt-2">No Rooms Found</h5>
                  <p className="text-muted small">Try modifying your filter or dates.</p>
                  <button className="btn btn-warning btn-sm fw-semibold" onClick={handleResetFilter}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {rooms.map((room) => (
                    <div key={room.roomId} className="col-md-6 col-lg-4">
                      <RoomCard 
                        room={room} 
                        onSelectRoom={handleBookingClick}
                        onShowOccupied={() => setActiveTab('occupied')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Occupied Rooms View */}
        {activeTab === 'occupied' && (
          <OccupiedRoomsView 
            user={user} 
            onRefreshRooms={() => fetchRooms(filterCheckIn, filterCheckOut, filterType)} 
          />
        )}

        {/* Dashboard View (Admin / Receptionist) */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            user={user}
            onNavigateToOccupied={() => setActiveTab('occupied')}
          />
        )}

        {/* Customer My Bookings View */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView 
            user={user}
            onExploreRooms={() => setActiveTab('rooms')}
          />
        )}

        {/* Admin Manage Rooms View */}
        {activeTab === 'manage-rooms' && (
          <AdminRoomsView 
            onRoomsUpdated={() => fetchRooms(filterCheckIn, filterCheckOut, filterType)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white-50 py-4 mt-auto border-top border-secondary">
        <div className="container text-center small">
          <div className="fw-bold text-white mb-1">Grand Horizon Hotel Management System</div>
          <div className="mb-2">Developed as part of ESOFT BIT Project Proposal • Academic Presentation Demo</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            Built with React 19, Bootstrap 5, ASP.NET Core 10 Web API, and MySQL 8.0 (Oracle EF Core provider)
          </div>
        </div>
      </footer>

      {/* Login / Register Modal */}
      <LoginModal 
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          showNotification(`Welcome back, ${loggedUser.fullName}! (${loggedUser.role})`, 'success');
        }}
      />

      {/* Booking Modal */}
      <BookingModal 
        show={showBookingModal}
        room={selectedRoom}
        user={user}
        initialCheckIn={filterCheckIn}
        initialCheckOut={filterCheckOut}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}
