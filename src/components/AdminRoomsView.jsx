import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getRoomImage } from '../assets/images';

export default function AdminRoomsView({ onRoomsUpdated }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New room state
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Standard Queen');
  const [pricePerNight, setPricePerNight] = useState('110');
  const [capacity, setCapacity] = useState('2');
  const [amenities, setAmenities] = useState('WiFi, Air Conditioning, TV, Mini Fridge');
  const [description, setDescription] = useState('');
  const [imageName, setImageName] = useState('room_standard.jpg');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addRoom({
        roomNumber: roomNumber.trim(),
        roomType: roomType.trim(),
        pricePerNight: parseFloat(pricePerNight),
        capacity: parseInt(capacity),
        status: 'Available',
        description: description.trim(),
        amenities: amenities.trim(),
        imageName: imageName
      });

      setSuccess(`Room #${roomNumber} added successfully!`);
      setTimeout(() => setSuccess(''), 4000);
      setShowAddModal(false);
      // Reset form
      setRoomNumber('');
      setDescription('');
      loadRooms();
      if (onRoomsUpdated) onRoomsUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (id, roomNum) => {
    if (!window.confirm(`Delete Room #${roomNum}?`)) return;
    try {
      await api.deleteRoom(id);
      setSuccess(`Room #${roomNum} deleted.`);
      setTimeout(() => setSuccess(''), 4000);
      loadRooms();
      if (onRoomsUpdated) onRoomsUpdated();
    } catch (err) {
      alert(err.message || 'Cannot delete room');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <span className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
              <i className="bi bi-gear-wide-connected"></i>
            </span>
            Room Inventory Management
          </h3>
          <p className="text-muted small mb-0">
            Administrator console to add, inspect, and maintain hotel room inventory.
          </p>
        </div>
        <button className="btn btn-warning fw-bold shadow-sm" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Add New Room
        </button>
      </div>

      {success && (
        <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-check-circle-fill"></i>
          <div>{success}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Loading rooms...</p>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-4 shadow-sm border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Room #</th>
                <th>Type</th>
                <th>Rate / Night</th>
                <th>Max Capacity</th>
                <th>Status</th>
                <th>Image Asset</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.roomId}>
                  <td>
                    <span className="badge bg-dark fs-6">#{r.roomNumber}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img 
                        src={getRoomImage(r.imageName)} 
                        alt={r.roomType}
                        className="rounded"
                        style={{ width: '45px', height: '40px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-bold text-dark">{r.roomType}</div>
                        <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
                          {r.amenities}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="fw-bold text-primary">${r.pricePerNight}</td>
                  <td>
                    <i className="bi bi-people-fill text-muted me-1"></i> {r.capacity} Guests
                  </td>
                  <td>
                    <span className={`badge ${r.displayStatus === 'Occupied' ? 'bg-danger' : 'bg-success'}`}>
                      {r.displayStatus || r.status}
                    </span>
                  </td>
                  <td>
                    <small className="badge bg-light text-secondary border font-monospace">
                      {r.imageName}
                    </small>
                  </td>
                  <td className="text-end">
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteRoom(r.roomId, r.roomNumber)}
                      title="Delete room"
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle text-warning me-2"></i> Add New Hotel Room
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                {error && (
                  <div className="alert alert-danger py-2 small mb-3">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddRoom}>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Room Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        placeholder="e.g. 401"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Room Type</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        placeholder="e.g. Deluxe Balcony"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Price Per Night ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control" 
                        required 
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Guest Capacity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        min="1" 
                        max="10" 
                        required 
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Room Image Asset</label>
                    <select 
                      className="form-select"
                      value={imageName}
                      onChange={(e) => setImageName(e.target.value)}
                    >
                      <option value="room_standard.jpg">Standard Room Photo (room_standard.jpg)</option>
                      <option value="room_deluxe.jpg">Deluxe Room Photo (room_deluxe.jpg)</option>
                      <option value="room_suite.jpg">Ocean View Suite Photo (room_suite.jpg)</option>
                      <option value="room_executive.jpg">Executive King Suite (room_executive.jpg)</option>
                      <option value="room_presidential.jpg">Presidential Penthouse (room_presidential.jpg)</option>
                      <option value="room_family.jpg">Family Villa Suite (room_family.jpg)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Amenities (comma-separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={amenities}
                      onChange={(e) => setAmenities(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief room overview..."
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-warning fw-bold px-4 shadow-sm">
                      Save Room
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
