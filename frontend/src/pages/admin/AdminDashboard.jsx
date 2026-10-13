import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { Users, BookOpen, CalendarCheck, Award, Building, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Overview</h1>
          <p className="page-subtitle">Real-time academic performance, attendance, and enrollment metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={<Users size={24} />}
          color="#eff6ff"
          textColor="#1e40af"
        />
        <StatCard
          title="Active Subjects"
          value={stats?.totalSubjects ?? 0}
          icon={<BookOpen size={24} />}
          color="#f0fdf4"
          textColor="#15803d"
        />
        <StatCard
          title="Campus Attendance"
          value={`${stats?.overallAttendancePercentage ?? 0}%`}
          icon={<CalendarCheck size={24} />}
          color="#fefce8"
          textColor="#a16207"
        />
        <StatCard
          title="Average Marks"
          value={`${stats?.averageMarksPercentage ?? 0}%`}
          icon={<Award size={24} />}
          color="#faf5ff"
          textColor="#7e22ce"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Department Distribution */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="#1e40af" />
            <span>Department Enrollment</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {stats?.departmentStudentDistribution && Object.keys(stats.departmentStudentDistribution).length > 0 ? (
              Object.entries(stats.departmentStudentDistribution).map(([dept, count]) => {
                const total = stats.totalStudents || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{dept}</span>
                      <span style={{ color: '#64748b' }}>{count} students ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: '#2563eb',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No department data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#1e40af" />
            <span>Recent System Activity</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{act.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{act.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{act.timestamp}</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent activities found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
