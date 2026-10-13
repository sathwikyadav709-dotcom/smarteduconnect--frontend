import React from 'react';

const StatCard = ({ title, value, icon, color = '#eff6ff', textColor = '#1e40af' }) => {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
      <div className="stat-icon" style={{ backgroundColor: color, color: textColor }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
