import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: string;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = '8px',
  color,
  className = '',
}) => {
  return (
    <div
      className={`progress-bar ${className}`}
      style={{
        height,
        borderRadius: '9999px',
        background: 'var(--border)',
        overflow: 'hidden',
        width: '100%',
        margin: '0.5rem 0'
      }}
    >
      <div
        className="progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          height: '100%',
          background: color || 'var(--blue)',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
};
