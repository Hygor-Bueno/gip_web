import React from 'react';

interface InfoFieldProps {
  label: string;
  value?: string | number | null;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  const display = value !== null && value !== undefined && value !== '' ? String(value) : null;
  return (
    <div className="info-field">
      <span className="info-field-label">{label}</span>
      <span className={`info-field-value${!display ? ' empty' : ''}`}>{display || '—'}</span>
    </div>
  );
};

export default InfoField;
