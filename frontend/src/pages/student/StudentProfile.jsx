import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Mail, Phone, Building, Calendar, Award } from 'lucide-react';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/student/profile');
      if (res.data?.success) setProfile(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading personal profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Academic Profile</h1>
          <p className="page-subtitle">Your official campus enrollment identity and institutional records</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.6rem' }}>
            {profile?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#0f2d59' }}>{profile?.fullName}</h2>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Roll Number: <strong style={{ color: '#1e40af' }}>{profile?.rollNumber}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Building size={22} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DEPARTMENT</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                {profile?.departmentName} ({profile?.departmentCode})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Award size={22} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ACADEMIC STATUS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                Year {profile?.academicYear} • Semester {profile?.semester}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Mail size={22} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>INSTITUTIONAL EMAIL</div>
              <div style={{ fontSize: '0.95rem', color: '#1e293b' }}>{profile?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Phone size={22} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PHONE NUMBER</div>
              <div style={{ fontSize: '0.95rem', color: '#1e293b' }}>{profile?.phone || 'Not provided'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Calendar size={22} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ENROLLMENT DATE</div>
              <div style={{ fontSize: '0.95rem', color: '#1e293b' }}>{profile?.enrollmentDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
