import React, { useState } from 'react';
import { api } from '../services/api';

export default function LoginModal({ show, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Customer');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register({
        fullName,
        email,
        password, // Plain text per demo requirement
        phone,
        address,
        role
      });
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail, demoPass) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-3 overflow-hidden">
          
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-shield-lock-fill text-warning me-2"></i>
              {isRegister ? 'Customer Registration' : 'Account Sign In'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Quick Demo Pre-fill Bar */}
            <div className="bg-light p-3 rounded-3 mb-3 border">
              <div className="small fw-bold text-muted mb-2 d-flex align-items-center gap-1">
                <i className="bi bi-lightning-charge-fill text-warning"></i> Quick Demo Auto-Fill:
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => fillQuickDemo('admin@hotel.com', 'admin123')}
                >
                  Admin
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-info btn-sm text-dark"
                  onClick={() => fillQuickDemo('reception@hotel.com', 'reception123')}
                >
                  Receptionist
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => fillQuickDemo('john.doe@example.com', 'customer123')}
                >
                  Customer (John)
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {!isRegister ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input 
                      type="email" 
                      className="form-control" 
                      required 
                      placeholder="name@hotel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-key"></i></span>
                    <input 
                      type="password" 
                      className="form-control" 
                      required 
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    * Plain-text authentication per demo requirements
                  </small>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-warning w-100 fw-bold py-2 mt-2 shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center mt-3 small">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="btn btn-link p-0 small text-decoration-none fw-semibold"
                    onClick={() => { setIsRegister(true); setError(''); }}
                  >
                    Register here
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    required 
                    placeholder="e.g. Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm" 
                      required 
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      required 
                      placeholder="+1 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Password</label>
                    <input 
                      type="password" 
                      className="form-control form-control-sm" 
                      required 
                      placeholder="Choose password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Role</label>
                    <select 
                      className="form-select form-select-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Address (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="e.g. 100 Main St, City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-warning w-100 fw-bold py-2 shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>

                <div className="text-center mt-3 small">
                  Already registered?{' '}
                  <button 
                    type="button" 
                    className="btn btn-link p-0 small text-decoration-none fw-semibold"
                    onClick={() => { setIsRegister(false); setError(''); }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
