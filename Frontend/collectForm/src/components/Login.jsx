import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://datacollectionapp-wgon.onrender.com/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save the real auth token we got from Django
        localStorage.setItem('adminSessionToken', data.token);
        
        // Also save it as the API key for fetching data (since we set the API to accept sk_ tokens)
        localStorage.setItem('trainerApiKey', data.token);
        
        navigate('/trustcollecteddatastudents');
      } else {
        setError(data.error || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Unable to connect to the server.');
    } finally {
      setIsLoading(false);
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
            <label className="form-label" style={{ color: '#111827' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="username" 
                value={credentials.username} 
                onChange={handleInputChange} 
                className="form-control" 
                style={{ paddingLeft: '2.5rem', backgroundColor: '#f9fafb' }}
                required 
                placeholder="admin_username" 
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

          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', padding: '0.8rem', marginTop: '2rem', fontSize: '1rem' }}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Login with your Django Superuser credentials
        </div>

      </div>
    </div>
  );
}
