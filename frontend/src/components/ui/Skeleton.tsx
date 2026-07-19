import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : '6px',
        background: 'var(--border)',
        opacity: 0.6,
        animation: 'pulse 1.8s infinite ease-in-out',
      }}
    />
  );
};
