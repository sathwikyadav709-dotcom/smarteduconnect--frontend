import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CalendarCheck, Award, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  const loadStudentDashboard = async () => {
    try {
      setLoading(true);
      const [profRes, transRes, subRes, attRes] = await Promise.all([
        api.get('/portal/student/profile'),
        api.get('/portal/student/transcript'),
        api.get('/portal/student/subjects'),
        api.get('/portal/student/attendance/summary')
      ]);

      if (profRes.data?.success) setProfile(profRes.data.data);
      if (transRes.data?.success) setTranscript(transRes.data.data);
      if (subRes.data?.success) setSubjects(subRes.data.data);
      if (attRes.data?.success) setAttendanceSummaries(attRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading your student portal...</p>
      </div>
    );
  }

  const overallAttendance = transcript?.attendancePercentage ?? 0;
  const isAttendanceLow = overallAttendance < 75.0 && overallAttendance > 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {profile?.fullName || user?.fullName}</h1>
          <p className="page-subtitle">
            Roll No: <strong>{profile?.rollNumber}</strong> • {profile?.departmentName} (Semester {profile?.semester})
          </p>
        </div>
        <Link to="/student/transcript" className="btn btn-primary">
          <FileText size={16} />
          <span>View Official Transcript</span>
        </Link>
      </div>

      {/* Attendance Warning Banner if < 75% */}
      {isAttendanceLow && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarCheck size={24} color="#ef4444" />
          <div>
            <strong>Low Attendance Notice:</strong> Your overall attendance is currently {overallAttendance}%, which is below the mandatory 75% university requirement. Please contact your department coordinator.
          </div>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="stats-grid">
        <StatCard
          title="Overall Attendance"
          value={`${overallAttendance}%`}
          icon={<CalendarCheck size={24} />}
          color={isAttendanceLow ? '#fef2f2' : '#f0fdf4'}
          textColor={isAttendanceLow ? '#ef4444' : '#15803d'}
        />
        <StatCard
          title="Cumulative CGPA"
          value={transcript?.cgpa ? transcript.cgpa.toFixed(2) : 'N/A'}
          icon={<Award size={24} />}
          color="#eff6ff"
          textColor="#1e40af"
        />
        <StatCard
          title="Total Credits Earned"
          value={transcript?.totalCredits ?? 0}
          icon={<BookOpen size={24} />}
          color="#faf5ff"
          textColor="#7e22ce"
        />
        <StatCard
          title="Enrolled Subjects"
          value={subjects.length}
          icon={<User size={24} />}
          color="#fefce8"
          textColor="#a16207"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Attendance Summary per Subject */}
        <div className="card">
          <h2 className="card-title">Subject Attendance Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {attendanceSummaries.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No attendance logged yet.</p>
            ) : (
              attendanceSummaries.map((item) => (
                <div key={item.subjectId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{item.subjectCode} - {item.subjectName}</span>
                    <span style={{ color: item.belowThreshold ? '#ef4444' : '#15803d', fontWeight: 700 }}>
                      {item.attendancePercentage}% ({item.presentClasses}/{item.totalClasses})
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(item.attendancePercentage, 100)}%`,
                        backgroundColor: item.belowThreshold ? '#ef4444' : '#10b981',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Enrolled Courses */}
        <div className="card">
          <h2 className="card-title">My Registered Courses</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subjects.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No courses registered currently.</p>
            ) : (
              subjects.map((sub) => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.9rem' }}>{sub.code}</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>{sub.name}</div>
                  </div>
                  <span className="badge badge-info">{sub.credits} Credits</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
