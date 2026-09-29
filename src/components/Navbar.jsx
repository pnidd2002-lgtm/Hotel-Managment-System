import React from 'react';

export default function Navbar({ 
  user, 
  activeTab, 
  setActiveTab, 
  onOpenLogin, 
  onLogout,
  onQuickSwitch 
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container">
        {/* Brand */}
        <a 
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-warning" 
          href="#home"
          onClick={(e) => { e.preventDefault(); setActiveTab('rooms'); }}
        >
          <i className="bi bi-buildings-fill fs-3 text-warning"></i>
          <div>
            <span className="fs-5 text-white">Grand Horizon</span>
            <small className="d-block text-warning opacity-75" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
              HOTEL & SUITES
            </small>
          </div>
        </a>

        {/* Toggle button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1">
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none px-3 rounded ${activeTab === 'rooms' ? 'active text-warning fw-semibold bg-secondary bg-opacity-25' : 'text-light'}`}
                onClick={() => setActiveTab('rooms')}
              >
                <i className="bi bi-door-open me-1"></i> Rooms & Booking
              </button>
            </li>

            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none px-3 rounded ${activeTab === 'occupied' ? 'active text-warning fw-semibold bg-secondary bg-opacity-25' : 'text-light'}`}
                onClick={() => setActiveTab('occupied')}
              >
                <i className="bi bi-person-slash me-1 text-danger"></i> Occupied Rooms
                <span className="badge bg-danger ms-1 text-white" style={{ fontSize: '0.65rem' }}>Live</span>
              </button>
            </li>

            {user && user.role === 'Customer' && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-decoration-none px-3 rounded ${activeTab === 'my-bookings' ? 'active text-warning fw-semibold bg-secondary bg-opacity-25' : 'text-light'}`}
                  onClick={() => setActiveTab('my-bookings')}
                >
                  <i className="bi bi-calendar2-check me-1"></i> My Bookings
                </button>
              </li>
            )}

            {user && (user.role === 'Admin' || user.role === 'Receptionist') && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-decoration-none px-3 rounded ${activeTab === 'dashboard' ? 'active text-warning fw-semibold bg-secondary bg-opacity-25' : 'text-light'}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Hotel Dashboard
                </button>
              </li>
            )}

            {user && user.role === 'Admin' && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-decoration-none px-3 rounded ${activeTab === 'manage-rooms' ? 'active text-warning fw-semibold bg-secondary bg-opacity-25' : 'text-light'}`}
                  onClick={() => setActiveTab('manage-rooms')}
                >
                  <i className="bi bi-gear-wide-connected me-1"></i> Room Admin
                </button>
              </li>
            )}
          </ul>

          {/* User Section & Demo Quick Switcher */}
          <div className="d-flex align-items-center gap-2">
            {/* Quick Demo Switcher */}
            <div className="dropdown">
              <button 
                className="btn btn-outline-warning btn-sm dropdown-toggle d-flex align-items-center gap-1" 
                type="button" 
                data-bs-toggle="dropdown"
                title="Switch role instantly for presentation"
              >
                <i className="bi bi-person-badge"></i> Demo Role
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li className="dropdown-header text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                  Quick Demo Switcher
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => onQuickSwitch('Admin')}>
                    <span className="badge bg-danger">Admin</span> Admin Manager
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => onQuickSwitch('Receptionist')}>
                    <span className="badge bg-info text-dark">Receptionist</span> Elena Rostova
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => onQuickSwitch('Customer')}>
                    <span className="badge bg-success">Customer</span> John Doe
                  </button>
                </li>
              </ul>
            </div>

            {user ? (
              <div className="d-flex align-items-center gap-2 ps-2 border-start border-secondary">
                <div className="text-end d-none d-md-block">
                  <div className="text-white fw-bold small">{user.fullName}</div>
                  <span className={`badge ${user.role === 'Admin' ? 'bg-danger' : user.role === 'Receptionist' ? 'bg-info text-dark' : 'bg-success'}`}>
                    {user.role}
                  </span>
                </div>
                <button 
                  className="btn btn-outline-light btn-sm ms-1"
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-warning btn-sm px-3 fw-semibold shadow-sm"
                onClick={onOpenLogin}
              >
                <i className="bi bi-person-fill me-1"></i> Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
