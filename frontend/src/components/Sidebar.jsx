import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  GraduationCap, 
  BarChart3, 
  FileText,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-brand">
        <div className="brand-icon">SC</div>
        <div>
          <div className="brand-title">Smart Campus</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>University Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, padding: '8px 16px' }}>
              Administration
            </div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Students</span>
            </NavLink>
            <NavLink to="/admin/subjects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={18} />
              <span>Subjects</span>
            </NavLink>
            <NavLink to="/admin/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarCheck size={18} />
              <span>Attendance</span>
            </NavLink>
            <NavLink to="/admin/marks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <GraduationCap size={18} />
              <span>Marks & Grading</span>
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, padding: '8px 16px' }}>
              Student Portal
            </div>
            <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <UserCheck size={18} />
              <span>My Profile</span>
            </NavLink>
            <NavLink to="/student/subjects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={18} />
              <span>My Subjects</span>
            </NavLink>
            <NavLink to="/student/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarCheck size={18} />
              <span>My Attendance</span>
            </NavLink>
            <NavLink to="/student/marks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <GraduationCap size={18} />
              <span>My Marks & Grades</span>
            </NavLink>
            <NavLink to="/student/transcript" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Official Transcript</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
