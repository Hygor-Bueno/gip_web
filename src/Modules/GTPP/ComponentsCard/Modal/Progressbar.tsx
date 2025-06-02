import React from 'react';

interface ProgressBarProps {
  progressValue: number;
  resetValue?: boolean;
  colorBar?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progressValue, colorBar }) => {
  const clampedValue = Math.min(Math.max((progressValue), 0), 100);

  const getProgressClass = () => {
    if (clampedValue < 50) return 'bg-danger';
    if (clampedValue < 75) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="progress mt-2 mx-2">
      <div
        title="Barra de progresso"
        className={`progress-bar ${!colorBar && getProgressClass()}`}
        role="progressbar"
        style={{ width: `${clampedValue}%`, backgroundColor: `${colorBar ? colorBar : ''}` }}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className='fw-bold'>{clampedValue}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;
