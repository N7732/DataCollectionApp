import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded mock credentials for simulation
    // TODO: Replace with actual Django API fetch request
    if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
      // Simulate saving session token
      localStorage.setItem('adminSessionToken', 'mock_secure_token_abc123');
      navigate('/trustcollecteddatastudents');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        
        <div className="flex flex-col items-center" style={{ marginBottom: '2rem' }}>
          <img src={logo} alt="Logo" className="app-logo" style={{ height: '60px', marginBottom: '1rem', borderRadius: '8px' }} />
          <h1 style={{ textAlign: 'center', fontSize: '1.5rem', color: '#111827', margin: 0 }}>Admin Login</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Sign in to access the dashboard.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" style={{ color: '#111827' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email" 
                value={credentials.email} 
                onChange={handleInputChange} 
                className="form-control" 
                style={{ paddingLeft: '2.5rem', backgroundColor: '#f9fafb' }}
                required 
                placeholder="admin@example.com" 
              />
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative', marginTop: '1.5rem' }}>
            <label className="form-label" style={{ color: '#111827' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                name="password" 
                value={credentials.password} 
                onChange={handleInputChange} 
                className="form-control" 
                style={{ paddingLeft: '2.5rem', backgroundColor: '#f9fafb' }}
                required 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '2rem', fontSize: '1rem' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          For testing: admin@example.com / password123
        </div>

      </div>
    </div>
  );
}
