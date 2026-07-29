import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Settings, LogOut, LayoutDashboard, Search, Edit, Trash2, Plus, X, Eye, Filter, FileText, Image as ImageIcon, Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logo from '../assets/logo.jpeg';
import AdminSettings from './AdminSettings';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trainers');
  
  // Status and Level Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      setApiError('');
      const apiKey = localStorage.getItem('trainerApiKey');
      
      try {
        const response = await fetch('https://datacollectionapp-wgon.onrender.com/api/trainers/', {
          headers: {
            'X-API-KEY': apiKey || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Map Django backend model names to the frontend's expected properties if needed
          const formattedData = data.map(item => ({
            ...item,
            name: item.name || 'Unknown',
            email: item.email || 'No Email',
            phone: item.Phone_number || 'N/A',
            level: item.level || 'Beginner',
            degree: item.Degree || 'N/A',
            status: item.Status || 'New',
            country: item.Country || 'N/A',
            city: item.City || 'N/A',
            address: item.Adress || 'N/A',
            college: item.college || 'N/A',
            experience_year: item.Experience_year || 0,
            where_hear: item.Where_did_Hear_us || 'N/A',
            created_at: item.created_at,
            cv_url: item.upload_cv,
            profile_url: item.profile_picture,
            rec_letter_url: item.Recommendation_letter
          }));
          setTrainers(formattedData);
        } else if (response.status === 403) {
          setApiError('Access Denied: Missing or Invalid API Key. Please generate one in Settings.');
        } else {
          setApiError('Failed to fetch trainer data.');
        }
      } catch (error) {
        setApiError('Network Error. Please check your internet connection or the API status.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'trainers' || activeTab === 'dashboard') {
      fetchTrainers();
    }
  }, [activeTab]);

  // Modal States
  const [viewTrainer, setViewTrainer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: '', email: '', phone: '', level: 'Beginner', degree: 'Bachelors', status: 'New', experience_year: '' });

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this trainer?')) {
      setTrainers(trainers.filter(t => t.id !== id));
      // Optionally fire a DELETE request here
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistically update UI
    const originalTrainers = [...trainers];
    setTrainers(trainers.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    try {
      const apiKey = localStorage.getItem('trainerApiKey');
      const response = await fetch(`https://datacollectionapp-wgon.onrender.com/api/trainers/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey || ''
        },
        body: JSON.stringify({ Status: newStatus })
      });
      
      if (!response.ok) {
        setTrainers(originalTrainers);
        alert('Failed to update status on the server.');
      }
    } catch (error) {
      console.error(error);
      setTrainers(originalTrainers);
      alert('Network error while updating status.');
    }
  };

  const handleAddTrainer = (e) => {
    e.preventDefault();
    setTrainers([{ ...newTrainer, id: Date.now() }, ...trainers]);
    setIsAddModalOpen(false);
    setNewTrainer({ name: '', email: '', phone: '', level: 'Beginner', degree: 'Bachelors', status: 'New', experience_year: '' });
  };

  // Filter Logic
  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesLevel = levelFilter === 'All' || t.level === levelFilter;
    
    let matchesTime = true;
    if (timeFilter !== 'All Time' && t.created_at) {
      const now = new Date();
      const createdDate = new Date(t.created_at);
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeFilter === 'This Week') matchesTime = diffDays <= 7;
      else if (timeFilter === 'This Month') matchesTime = diffDays <= 30;
      else if (timeFilter === 'Last 3 Months') matchesTime = diffDays <= 90;
    }
    
    return matchesSearch && matchesStatus && matchesLevel && matchesTime;
  });

  // Prepare data for the chart
  const getChartData = () => {
    const monthCounts = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months with 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthCounts[`${months[d.getMonth()]} ${d.getFullYear()}`] = 0;
    }

    trainers.forEach(t => {
      if (t.created_at) {
        const d = new Date(t.created_at);
        const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
        if (monthCounts[key] !== undefined) {
          monthCounts[key]++;
        }
      }
    });
    
    return Object.keys(monthCounts).map(key => ({
      name: key,
      Registrations: monthCounts[key]
    }));
  };
  
  const chartData = getChartData();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar white-panel" style={{ borderRadius: 0 }}>
        <div className="sidebar-logo">
          <img src={logo} alt="App Logo" />
          <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#111827' }}>Superadmin</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'trainers' ? 'active' : ''}`} onClick={() => setActiveTab('trainers')} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <Users size={20} />
            Trainers
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button 
            className="nav-item" 
            onClick={() => {
              localStorage.removeItem('adminSessionToken');
              navigate('/login');
            }} 
            style={{ color: 'var(--error-color)', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content" style={{ position: 'relative' }}>
        
        {activeTab === 'settings' && <AdminSettings />}

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ color: '#ffffff' }}>Overview Dashboard</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>High-level metrics of your trainer applications.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="white-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Total Applications</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#111827' }}>{trainers.length}</p>
              </div>
              <div className="white-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>New / Under Review</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#111827' }}>
                  {trainers.filter(t => t.status === 'New' || t.status === 'Under Review').length}
                </p>
              </div>
              <div className="white-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success-color)' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Active Trainers</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#111827' }}>
                  {trainers.filter(t => t.status === 'Active to Our Course').length}
                </p>
              </div>
            </div>

            <div className="white-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#111827' }}>Registration Trend (Last 6 Months)</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    />
                    <Area type="monotone" dataKey="Registrations" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorReg)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="white-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>Recent Activity</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The system is currently running smoothly. You have {trainers.length} total trainers registered in the database.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('trainers')} style={{ marginTop: '1rem' }}>View All Trainers</button>
            </div>
          </div>
        )}

        {activeTab === 'trainers' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
              <div>
                <h1 style={{ color: '#ffffff' }}>Trainers Management</h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Manage trainer applications and profiles.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} />
                Add Trainer
              </button>
            </div>

            <div className="white-panel" style={{ padding: '2rem' }}>
              {/* Toolbar with Filters */}
              <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name or email..." 
                    style={{ paddingLeft: '2.5rem', backgroundColor: '#f9fafb' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Filters:</span>
                  </div>
                  
                  <select className="form-control" style={{ width: 'auto', backgroundColor: '#f9fafb' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Communicated">Communicated</option>
                    <option value="Contract Signed">Contract Signed</option>
                    <option value="Training Session Conducted">Training Session Conducted</option>
                    <option value="Active to Our Course">Active to Our Course</option>
                    <option value="Rejected to Our Course">Rejected to Our Course</option>
                    <option value="Other">Other</option>
                  </select>

                  <select className="form-control" style={{ width: 'auto', backgroundColor: '#f9fafb' }} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                    <option value="All Time">All Time</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Last 3 Months">Last 3 Months</option>
                  </select>

                  <select className="form-control" style={{ width: 'auto', backgroundColor: '#f9fafb' }} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ color: '#4b5563' }}>Name</th>
                      <th style={{ color: '#4b5563' }}>Contact</th>
                      <th style={{ color: '#4b5563' }}>Level</th>
                      <th style={{ color: '#4b5563' }}>Degree</th>
                      <th style={{ color: '#4b5563' }}>Status</th>
                      <th style={{ color: '#4b5563' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          Loading trainers...
                        </td>
                      </tr>
                    ) : apiError ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--error-color)' }}>
                          {apiError}
                        </td>
                      </tr>
                    ) : filteredTrainers.length > 0 ? (
                      filteredTrainers.map(trainer => (
                        <tr key={trainer.id}>
                          <td 
                            style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-color)' }} 
                            onClick={() => setViewTrainer(trainer)}
                            title="Click to view full details"
                          >
                            {trainer.name}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.9rem', color: '#111827' }}>{trainer.phone}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trainer.email}</div>
                          </td>
                          <td>
                            <span className={`badge ${trainer.level === 'Advanced' ? 'badge-purple' : trainer.level === 'Intermediate' ? 'badge-blue' : 'badge-green'}`}>
                              {trainer.level}
                            </span>
                          </td>
                          <td style={{ color: '#111827' }}>{trainer.degree}</td>
                          <td>
                            <select 
                              className="form-control" 
                              style={{ padding: '0.2rem', fontSize: '0.85rem', width: '130px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                              value={trainer.status}
                              onChange={(e) => handleStatusChange(trainer.id, e.target.value)}
                            >
                              <option value="New">New</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Communicated">Communicated</option>
                              <option value="Contract Signed">Contract Signed</option>
                              <option value="Training Session Conducted">Training Session Conducted</option>
                              <option value="Active to Our Course">Active to Our Course</option>
                              <option value="Rejected to Our Course">Rejected to Our Course</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-secondary" style={{ padding: '0.4rem', backgroundColor: '#f3f4f6' }} onClick={() => setViewTrainer(trainer)} title="View All Data">
                                <Eye size={16} color="#111827" />
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.4rem' }} title="Delete" onClick={() => handleDelete(trainer.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No trainers found matching the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* View Trainer Modal - Fully White & Structured */}
      {viewTrainer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '4vh', zIndex: 100, overflowY: 'auto' }}>
          <div className="white-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '800px', marginBottom: '4vh' }}>
            
            {/* Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#111827' }}>Trainer Details</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>Submitted Application Data</p>
              </div>
              <button className="btn" style={{ padding: '0.5rem', background: '#f3f4f6', color: '#111827' }} onClick={() => setViewTrainer(null)}>
                <X size={24} />
              </button>
            </div>
            
            {/* Profile Summary Header */}
            <div className="flex items-center gap-4" style={{ marginBottom: '2rem', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ImageIcon size={32} color="#9ca3af" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', margin: 0, color: '#111827' }}>{viewTrainer.name}</h3>
                <p style={{ margin: '0.2rem 0', color: 'var(--text-muted)' }}>{viewTrainer.email} • {viewTrainer.phone}</p>
                <span className="badge badge-purple" style={{ marginTop: '0.5rem' }}>{viewTrainer.status}</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* Personal Info */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} /> Personal Info
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Location</span><br/><strong style={{ color: '#111827' }}>{viewTrainer.city}, {viewTrainer.country}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Address</span><br/><strong style={{ color: '#111827' }}>{viewTrainer.address || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Heard About Us Via</span><br/><strong style={{ color: '#111827' }}>{viewTrainer.where_hear || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Education & Experience */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} /> Experience & Ed.
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>University/College</span><br/><strong style={{ color: '#111827' }}>{viewTrainer.college}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Degree & Level</span><br/><strong style={{ color: '#111827' }}>{viewTrainer.degree} ({viewTrainer.level})</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Experience</span><br/><strong style={{ color: '#111827' }}>{viewTrainer.experience_year} Years</strong></div>
                </div>
              </div>

              {/* Bio */}
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Bio / Summary</h4>
                <p style={{ color: '#374151', lineHeight: '1.6' }}>{viewTrainer.bio || 'No bio provided.'}</p>
              </div>

              {/* Uploaded Files Section */}
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '1.5rem', marginTop: '0.5rem' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Uploaded Documents</h4>
                <div className="flex gap-4 flex-wrap">
                  
                  <div className="white-panel" style={{ flex: 1, minWidth: '200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                    <div style={{ background: '#e0e7ff', padding: '0.8rem', borderRadius: '8px' }}><ImageIcon size={24} color="var(--primary-color)" /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>Profile Picture</p>
                      <a href="#" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Download size={14}/> Download</a>
                    </div>
                  </div>

                  <div className="white-panel" style={{ flex: 1, minWidth: '200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                    <div style={{ background: '#e0e7ff', padding: '0.8rem', borderRadius: '8px' }}><FileText size={24} color="var(--primary-color)" /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>CV / Resume</p>
                      <a href="#" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Download size={14}/> Download</a>
                    </div>
                  </div>

                  <div className="white-panel" style={{ flex: 1, minWidth: '200px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                    <div style={{ background: '#e0e7ff', padding: '0.8rem', borderRadius: '8px' }}><FileText size={24} color="var(--primary-color)" /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>Rec. Letter</p>
                      <a href="#" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Download size={14}/> Download</a>
                    </div>
                  </div>

                </div>
              </div>

            </div>
            
            <div className="flex justify-end" style={{ marginTop: '2rem', borderTop: '2px solid #f3f4f6', paddingTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setViewTrainer(null)} style={{ padding: '0.8rem 2rem' }}>Close Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Trainer Modal (Simplified for visual completeness) */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="white-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>Add New Trainer</h2>
              <button className="btn" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddTrainer}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#111827' }}>Name</label>
                <input type="text" className="form-control" style={{ backgroundColor: '#f9fafb' }} value={newTrainer.name} onChange={e => setNewTrainer({...newTrainer, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#111827' }}>Email</label>
                <input type="email" className="form-control" style={{ backgroundColor: '#f9fafb' }} value={newTrainer.email} onChange={e => setNewTrainer({...newTrainer, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#111827' }}>Total Experience (Years)</label>
                <input type="text" className="form-control" style={{ backgroundColor: '#f9fafb' }} value={newTrainer.experience_year} onChange={e => setNewTrainer({...newTrainer, experience_year: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#111827' }}>Status</label>
                <select className="form-control" style={{ backgroundColor: '#f9fafb' }} value={newTrainer.status} onChange={e => setNewTrainer({...newTrainer, status: e.target.value})}>
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Active to Our Course">Active to Our Course</option>
                </select>
              </div>
              <div className="flex justify-end gap-2" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Trainer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
