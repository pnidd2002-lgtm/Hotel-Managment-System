// Simple API service communicating with ASP.NET Core Web API
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  getCustomers: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/customers`);
    return res.json();
  },

  // Rooms
  getRooms: async (checkIn = null, checkOut = null, roomType = null) => {
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (roomType) params.append('roomType', roomType);

    const res = await fetch(`${API_BASE_URL}/rooms?${params.toString()}`);
    return res.json();
  },

  addRoom: async (room) => {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to add room' }));
      throw new Error(err.message || 'Failed to add room');
    }
    return res.json();
  },

  deleteRoom: async (id) => {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to delete room' }));
      throw new Error(err.message || 'Failed to delete room');
    }
    return res.json();
  },

  // Bookings
  getBookings: async (customerId = null) => {
    const url = customerId 
      ? `${API_BASE_URL}/bookings?customerId=${customerId}` 
      : `${API_BASE_URL}/bookings`;
    const res = await fetch(url);
    return res.json();
  },

  // Show Occupied Rooms (with optional date)
  getOccupiedRooms: async (targetDate = null) => {
    const url = targetDate 
      ? `${API_BASE_URL}/bookings/occupied-rooms?targetDate=${targetDate}`
      : `${API_BASE_URL}/bookings/occupied-rooms`;
    const res = await fetch(url);
    return res.json();
  },

  createBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create booking');
    }
    return data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingStatus: status })
    });
    return res.json();
  },

  cancelBooking: async (bookingId) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return res.json();
  }
};
