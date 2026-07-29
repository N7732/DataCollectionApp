import React, { useState, useEffect } from 'react';
import { Key, UserPlus, Settings2, Copy, Check } from 'lucide-react';

export default function AdminSettings() {
  // Form Visibility Settings
  const [formConfig, setFormConfig] = useState(() => {
    const saved = localStorage.getItem('trainerFormConfig');
    return saved ? JSON.parse(saved) : { step1: true, step2: true, step3: true };
  });

  // Sub-Admin State
  const [subAdmin, setSubAdmin] = useState({ name: '', email: '', password: '', canDelete: false });
  const [subAdminsList, setSubAdminsList] = useState([]);

  // API Token State
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('trainerApiKey') || '');
  const [copied, setCopied] = useState(false);

  // Save Form Config
  useEffect(() => {
    localStorage.setItem('trainerFormConfig', JSON.stringify(formConfig));
  }, [formConfig]);

  const handleFormConfigChange = (step) => {
    if (step === 'step1') return; // Step 1 is mandatory
    setFormConfig(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSubAdmin(prev => ({ ...prev, password: pwd }));
  };

  const handleCreateSubAdmin = (e) => {
    e.preventDefault();
    if (!subAdmin.name || !subAdmin.email || !subAdmin.password) {
      alert('Please fill out all sub-admin fields and generate a password.');
      return;
    }
    setSubAdminsList([...subAdminsList, { ...subAdmin, id: Date.now() }]);
    setSubAdmin({ name: '', email: '', password: '', canDelete: false });
    alert('Sub-Admin created successfully!');
  };

  const generateApiToken = () => {
    const token = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiToken(token);
    localStorage.setItem('trainerApiKey', token);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!apiToken) return;
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ color: '#ffffff' }}>Dashboard Settings</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Manage form visibility, user access, and API configurations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Form Visibility Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <Settings2 size={24} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Trainer Form Configuration</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Select which parts of the application form are visible and required for users.
          </p>
          
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
              <input type="checkbox" checked={formConfig.step1} readOnly style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 500 }}>Part 1: Personal Information (Mandatory)</span>
            </label>
            
            <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={formConfig.step2} onChange={() => handleFormConfigChange('step2')} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 500 }}>Part 2: Education & Experience</span>
            </label>

            <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={formConfig.step3} onChange={() => handleFormConfigChange('step3')} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 500 }}>Part 3: Document Uploads</span>
            </label>
          </div>
        </div>

        {/* API Access Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <Key size={24} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>API Access</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Generate a secure API token to share with other sites so they can access the Trainer database.
          </p>

          {apiToken ? (
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <input type="text" value={apiToken} readOnly className="form-control" style={{ fontFamily: 'monospace' }} />
              <button className="btn btn-secondary" onClick={copyToClipboard} title="Copy to clipboard">
                {copied ? <Check size={18} color="var(--success-color)" /> : <Copy size={18} />}
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={generateApiToken} style={{ marginBottom: '1rem' }}>
              Generate New API Token
            </button>
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--error-color)' }}>Keep this token secret. Do not expose it in public client-side code.</p>
        </div>

        {/* Sub-Admin Management */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <UserPlus size={24} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Sub-Admin Management</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Create new administrator accounts. By default, they have Create, Read, and Update (CRU) privileges.
          </p>

          <form onSubmit={handleCreateSubAdmin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input type="text" className="form-control" value={subAdmin.name} onChange={e => setSubAdmin({...subAdmin, name: e.target.value})} placeholder="Admin Name" />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={subAdmin.email} onChange={e => setSubAdmin({...subAdmin, email: e.target.value})} placeholder="admin@example.com" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div className="flex gap-2">
                <input type="text" className="form-control" value={subAdmin.password} readOnly placeholder="Generated Password" />
                <button type="button" className="btn btn-secondary" onClick={generatePassword}>Generate</button>
              </div>
            </div>

            <div className="form-group flex flex-col justify-center" style={{ marginBottom: 0, marginTop: '1.5rem' }}>
              <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
                {/* Custom Toggle Switch */}
                <div style={{
                  position: 'relative', width: '40px', height: '22px', borderRadius: '11px', 
                  backgroundColor: subAdmin.canDelete ? 'var(--error-color)' : '#d1d5db',
                  transition: 'background-color 0.3s'
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: subAdmin.canDelete ? '20px' : '2px',
                    width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                    transition: 'left 0.3s'
                  }}></div>
                  <input type="checkbox" checked={subAdmin.canDelete} onChange={e => setSubAdmin({...subAdmin, canDelete: e.target.checked})} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </div>
                <div>
                  <span style={{ fontWeight: 500, display: 'block' }}>Allow Delete Privilege</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>If off, user can only Create, Read, Update</span>
                </div>
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Create Sub-Admin</button>
            </div>
          </form>

          {/* List of generated sub admins (for visual feedback) */}
          {subAdminsList.length > 0 && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recently Created Admins</h3>
              <div className="table-container">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Privileges</th></tr></thead>
                  <tbody>
                    {subAdminsList.map(admin => (
                      <tr key={admin.id}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>
                          <span className={`badge ${admin.canDelete ? 'badge-purple' : 'badge-green'}`}>
                            {admin.canDelete ? 'CRUD' : 'CRU'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
