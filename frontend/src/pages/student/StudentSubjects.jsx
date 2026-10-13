import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Layers, Award } from 'lucide-react';

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySubjects();
  }, []);

  const fetchMySubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/student/subjects');
      if (res.data?.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading registered subjects...</p>
      </div>
    );
  }

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enrolled Academic Subjects</h1>
          <p className="page-subtitle">Your active course enrollments and syllabus registrations for this term</p>
        </div>
        <div style={{ background: '#eff6ff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
            Total Registered Credits: <strong>{totalCredits}</strong>
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {subjects.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#64748b' }}>No subjects currently registered for your account.</p>
          </div>
        ) : (
          subjects.map((sub) => (
            <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '1.1rem' }}>
                    {sub.code}
                  </span>
                  <span className="badge badge-info">{sub.credits} Credits</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', color: '#0f2d59', marginBottom: '8px' }}>
                  {sub.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Department: <strong>{sub.departmentName || sub.departmentCode}</strong></div>
                  <div>Curriculum: <strong>Semester {sub.semester}</strong></div>
                  <div>Maximum Marks: <strong>{sub.maxMarks}</strong></div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">Active Enrollment</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Core Course</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;
