import React from 'react';
import { getRoomImage } from '../assets/images';

export default function RoomCard({ room, onSelectRoom, onShowOccupied }) {
  const isAvailable = room.isAvailable ?? (room.displayStatus === 'Available' || room.status === 'Available');
  const isOccupied = room.displayStatus === 'Occupied';

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative transition-all">
      {/* Status Badge */}
      <span 
        className={`position-absolute top-0 end-0 m-3 badge shadow-sm px-3 py-2 fw-semibold ${
          isOccupied ? 'bg-danger' : 'bg-success'
        }`}
        style={{ zIndex: 2 }}
      >
        <i className={`bi ${isOccupied ? 'bi-lock-fill' : 'bi-check-circle-fill'} me-1`}></i>
        {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
      </span>

      {/* Room Image */}
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img 
          src={getRoomImage(room.imageName)} 
          alt={room.roomType}
          className="w-100 h-100 object-fit-cover"
        />
        <div 
          className="position-absolute bottom-0 start-0 w-100 p-2 text-white" 
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}
        >
          <span className="badge bg-dark bg-opacity-75">Room #{room.roomNumber}</span>
          <span className="badge bg-secondary ms-1"><i className="bi bi-people-fill me-1"></i>Max {room.capacity}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold text-dark mb-0">{room.roomType}</h5>
          <div className="text-end">
            <span className="fs-5 fw-bold text-primary">${room.pricePerNight}</span>
            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>per night</small>
          </div>
        </div>

        <p className="card-text text-secondary small mb-3 flex-grow-1" style={{ minHeight: '48px' }}>
          {room.description || 'Comfortable stay with modern hotel amenities and 24/7 service.'}
        </p>

        {/* Amenities Pills */}
        <div className="mb-3 d-flex flex-wrap gap-1">
          {room.amenities ? room.amenities.split(',').map((amenity, idx) => (
            <span key={idx} className="badge bg-light text-secondary border small fw-normal py-1 px-2">
              <i className="bi bi-check2 text-success me-1"></i>
              {amenity.trim()}
            </span>
          )) : null}
        </div>

        {/* Actions */}
        <div className="pt-2 border-top mt-auto">
          {isOccupied ? (
            <div className="d-flex gap-2 align-items-center">
              <button 
                className="btn btn-outline-danger w-100 fw-semibold btn-sm py-2"
                onClick={onShowOccupied}
              >
                <i className="bi bi-eye me-1"></i> View Occupancy
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-warning w-100 fw-bold btn-sm py-2 shadow-sm text-dark"
              onClick={() => onSelectRoom(room)}
            >
              <i className="bi bi-calendar2-plus me-1"></i> Book This Room
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
