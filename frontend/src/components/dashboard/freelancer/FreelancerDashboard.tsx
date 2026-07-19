import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { freelancerApi } from '../../../api/applications';
import { Badge } from '../../ui';

export const FreelancerDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const activeTab = useDashboardStore((s) => s.activeTab);
  const addToast = useAppStore((s) => s.addToast);

  const freelancerProfiles = useAppStore((s) => s.freelancerProfiles) ?? {};
  const myProfile = user ? freelancerProfiles[user.email] : null;

  // Local form states
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [rate, setRate] = useState('$35/hr');

  // Sync profile details to form when loaded
  useEffect(() => {
    if (myProfile) {
      setSkills(myProfile.skills || '');
      setAvailability(myProfile.availability || 'Available');
      setRate(myProfile.rate || '$35/hr');
    }
  }, [myProfile]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await freelancerApi.updateProfile({
        email: user.email,
        skills,
        availability,
        rate,
      });
      if (res.success) {
        addToast('Freelancer profile updated successfully!', 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const contracts = myProfile?.contracts ?? [];

  // Overview Tab
  if (activeTab === 'overview') {
    return (
      <div className="dash-overview">
        <div className="dash-card-grid">
          <div className="dash-card">
            <div className="dc-num">{contracts.length}</div>
            <div className="dc-label">Total contracts</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{myProfile?.availability || 'Available'}</div>
            <div className="dc-label">Status</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{myProfile?.rate || '$35/hr'}</div>
            <div className="dc-label">Hourly rate</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Profile Summary</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Managed by RDK Talent Operations</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Skills registered:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--text2)', fontSize: '0.85rem' }}>
                {myProfile?.skills || 'None registered yet. Update in the Skills tab.'}
              </p>
            </div>
            <div>
              <strong>Connected Email:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--text2)', fontSize: '0.85rem' }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contracts Tab
  if (activeTab === 'contracts') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Your active contracts</h3>
        {contracts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>
            No contracts assigned by RDK administrators yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Contract ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Contract Title</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Billing Rate</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{c.id}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{c.title}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{c.rate}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Skills Tab
  if (activeTab === 'skills') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Edit professional profile</h3>
        <form onSubmit={handleSubmitProfile} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Next.js, Node, Python, AWS"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Availability status</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option>Available</option>
              <option>Busy</option>
              <option>Not Available</option>
            </select>
          </div>
          <div className="form-group">
            <label>Target Hourly Rate</label>
            <input
              type="text"
              placeholder="e.g. $45/hr"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Update Profile
          </button>
        </form>
      </div>
    );
  }

  return null;
};
export default FreelancerDashboard;
