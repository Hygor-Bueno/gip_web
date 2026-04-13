import React from 'react';

interface InfoSectionProps {
  icon: string;
  color: string;
  title: string;
  children: React.ReactNode;
}

const InfoSection: React.FC<InfoSectionProps> = ({ icon, color, title, children }) => (
  <div className="info-section">
    <div className="info-section-header">
      <div className="info-section-icon" style={{ background: color, color: '#fff' }}>
        <i className={`fa ${icon} text-white`}></i>
      </div>
      <span className="info-section-title">{title}</span>
    </div>
    {children}
  </div>
);

export default InfoSection;
