import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.jpeg';

export default function TrainerForm() {
  const [step, setStep] = useState(1);
  const [formConfig, setFormConfig] = useState({ step1: true, step2: true, step3: true });
  
  const [formData, setFormData] = useState({
    name: '', email: '', Phone_number: '', Country: '', City: '', Adress: '', Where_did_Hear_us: '',
    college: '', Degree: '', level: 'Beginner', years_experience_backend: '', years_experience_frontend: '', bio: ''
  });

  const [files, setFiles] = useState({ upload_cv: null, Recommendation_letter: null, profile_picture: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('trainerFormConfig');
    if (saved) {
      setFormConfig(JSON.parse(saved));
    }
  }, []);

  // Determine available steps
  const availableSteps = [1];
  if (formConfig.step2) availableSteps.push(2);
  if (formConfig.step3) availableSteps.push(3);
  
  const totalSteps = availableSteps.length;
  const currentStepIndex = availableSteps.indexOf(step);
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) setFiles(prev => ({ ...prev, [name]: files[0] }));
  };

  const nextStep = () => {
    if (!isLastStep) {
      setStep(availableSteps[currentStepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setStep(availableSteps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create FormData for the backend API (handles files + text)
    const formDataToSend = new FormData();
    
    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) formDataToSend.append(key, formData[key]);
    });
    
    // Append all file fields
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formDataToSend.append(key, files[key]);
      }
    });

    try {
      const response = await fetch('https://datacollectionapp-wgon.onrender.com/api/trainers/', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error('Server Validation Errors:', errorData);
        alert('Failed to submit. Please ensure all required fields are correct.');
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Network error. Make sure the Django server is running on port 8000.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '100vh', padding: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: 'var(--success-color)', marginBottom: '0.5rem' }}>✓</div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thank you for applying. We have received your information and will be in touch soon.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => { setSubmitted(false); setStep(1); }}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex justify-center items-center" style={{ padding: '1rem', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem 2rem', width: '100%', maxWidth: '850px', backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
        
        <div className="flex flex-col items-center" style={{ marginBottom: '1rem' }}>
          <img src={logo} alt="Logo" className="app-logo" style={{ height: '40px', marginBottom: '0.5rem', borderRadius: '8px' }} />
          <h1 style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '0.2rem' }}>Trainer Application</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Step {currentStepIndex + 1} of {totalSteps}: {step === 1 ? 'Personal Info' : step === 2 ? 'Education & Exp' : 'Documents'}
          </p>
          
          <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <form onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex gap-4" style={{ marginBottom: '0.8rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" required placeholder="John Doe" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" required placeholder="john@example.com" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Phone *</label>
                  <input type="text" name="Phone_number" value={formData.Phone_number} onChange={handleInputChange} className="form-control" required placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="flex gap-4" style={{ marginBottom: '0.8rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Country</label>
                  <input type="text" name="Country" value={formData.Country} onChange={handleInputChange} className="form-control" placeholder="e.g. United States" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">City</label>
                  <input type="text" name="City" value={formData.City} onChange={handleInputChange} className="form-control" placeholder="e.g. New York" />
                </div>
                <div className="form-group" style={{ flex: 1.5, marginBottom: 0 }}>
                  <label className="form-label">Address</label>
                  <input type="text" name="Adress" value={formData.Adress} onChange={handleInputChange} className="form-control" placeholder="123 Main St, Apt 4B" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">How did you hear about us?</label>
                <select name="Where_did_Hear_us" value={formData.Where_did_Hear_us} onChange={handleInputChange} className="form-control" style={{ width: '50%' }}>
                  <option value="">Please select...</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Website">Website</option>
                  <option value="Friend">Friend</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex gap-4" style={{ marginBottom: '0.8rem' }}>
                <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label className="form-label">College/University</label>
                  <input type="text" name="college" value={formData.college} onChange={handleInputChange} className="form-control" placeholder="Where did you study?" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Degree</label>
                  <select name="Degree" value={formData.Degree} onChange={handleInputChange} className="form-control">
                    <option value="">Select Degree...</option>
                    <option value="High School">High School</option>
                    <option value="Diploma A1">Diploma A1</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Level</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="form-control">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4" style={{ marginBottom: '0.8rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Backend Exp. (Years)</label>
                  <input type="number" min="0" name="years_experience_backend" value={formData.years_experience_backend} onChange={handleInputChange} className="form-control" placeholder="e.g. 3" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Frontend Exp. (Years)</label>
                  <input type="number" min="0" name="years_experience_frontend" value={formData.years_experience_frontend} onChange={handleInputChange} className="form-control" placeholder="e.g. 2" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bio / Summary</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="form-control" placeholder="Briefly describe your expertise..."></textarea>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>Upload Required Documents</h3>
                <div className="flex gap-4">
                  <div className="glass-panel" style={{ flex: 1, padding: '1rem', border: '1px dashed var(--primary-color)', backgroundColor: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Profile Pic</label>
                    <input type="file" name="profile_picture" onChange={handleFileChange} className="form-control form-file" accept="image/*" />
                  </div>
                  <div className="glass-panel" style={{ flex: 1, padding: '1rem', border: '1px dashed var(--primary-color)', backgroundColor: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>CV / Resume</label>
                    <input type="file" name="upload_cv" onChange={handleFileChange} className="form-control form-file" accept=".pdf,.doc,.docx" />
                  </div>
                  <div className="glass-panel" style={{ flex: 1, padding: '1rem', border: '1px dashed var(--primary-color)', backgroundColor: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Rec Letter</label>
                    <input type="file" name="Recommendation_letter" onChange={handleFileChange} className="form-control form-file" accept=".pdf,.doc,.docx" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            {currentStepIndex > 0 ? (
              <button type="button" className="btn btn-secondary" onClick={prevStep} style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {!isLastStep ? (
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                Next Step
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
