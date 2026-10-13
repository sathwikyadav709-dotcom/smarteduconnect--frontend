import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const StudentAttendance = () => {
  const [summaries, setSummaries] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [sumRes, histRes] = await Promise.all([
        api.get('/portal/student/attendance/summary'),
        api.get('/portal/student/attendance')
      ]);

      if (sumRes.data?.success) setSummaries(sumRes.data.data);
      if (histRes.data?.success) setHistory(histRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading attendance records...</p>
      </div>
    );
  }

  const totalClassesSum = summaries.reduce((acc, s) => acc + s.totalClasses, 0);
  const presentClassesSum = summaries.reduce((acc, s) => acc + s.presentClasses, 0);
  const overallPercentage =
    totalClassesSum > 0 ? Math.round((presentClassesSum / totalClassesSum) * 10000) / 100 : 0.0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance Record</h1>
          <p className="page-subtitle">Subject-wise class attendance percentages and daily session logs</p>
        </div>
        <div style={{ background: overallPercentage < 75.0 ? '#fef2f2' : '#ecfdf5', padding: '10px 18px', borderRadius: '10px', border: `1px solid ${overallPercentage < 75.0 ? '#fecaca' : '#a7f3d0'}` }}>
          <span style={{ fontSize: '0.9rem', color: overallPercentage < 75.0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
            Overall Attendance: {overallPercentage}% ({presentClassesSum} / {totalClassesSum} Classes)
          </span>
        </div>
      </div>

      {overallPercentage < 75.0 && totalClassesSum > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AlertTriangle size={24} color="#ef4444" flexShrink={0} />
          <div style={{ fontSize: '0.9rem' }}>
            <strong>Caution:</strong> Your attendance is below the institutional threshold of 75%. Please ensure you attend subsequent lectures to remain eligible for the semester examinations.
          </div>
        </div>
      )}

      {/* Subject Summaries Cards */}
      <h2 style={{ fontSize: '1.15rem', color: '#0f2d59', marginBottom: '16px' }}>Subject-wise Attendance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {summaries.length === 0 ? (
          <p style={{ color: '#64748b' }}>No subject attendance recorded yet.</p>
        ) : (
          summaries.map((s) => (
            <div key={s.subjectId} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: '#1e40af' }}>{s.subjectCode}</span>
                {s.belowThreshold ? (
                  <span className="badge badge-danger">Low (&lt;75%)</span>
                ) : (
                  <span className="badge badge-success">Eligible</span>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', marginBottom: '12px' }}>
                {s.subjectName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                <span>Present: {s.presentClasses} / {s.totalClasses} classes</span>
                <span style={{ fontWeight: 700, color: s.belowThreshold ? '#ef4444' : '#10b981' }}>{s.attendancePercentage}%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(s.attendancePercentage, 100)}%`,
                    backgroundColor: s.belowThreshold ? '#ef4444' : '#10b981',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Daily Attendance History */}
      <h2 style={{ fontSize: '1.15rem', color: '#0f2d59', marginBottom: '16px' }}>Detailed Session History</h2>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No daily attendance entries recorded yet.
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 500 }}>{h.attendanceDate}</td>
                  <td>{h.subjectCode} — {h.subjectName}</td>
                  <td>
                    <span
                      className={`badge ${h.isPresent ? 'badge-success' : 'badge-danger'}`}
                      style={{ display: 'inline-flex', gap: '4px' }}
                    >
                      {h.isPresent ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {h.isPresent ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{h.remarks || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;
