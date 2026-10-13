import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="top-navbar no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
          Smart Campus Management System
        </span>
      </div>

      <div className="nav-user-info">
        <div style={{ textAlign: 'right' }}>
          <div className="user-name">{user?.fullName || 'User'}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{user?.email}</div>
        </div>
        <span className="user-badge">
          {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Student'}
        </span>
        <button 
          onClick={logout} 
          className="btn btn-secondary btn-sm"
          title="Sign Out"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
