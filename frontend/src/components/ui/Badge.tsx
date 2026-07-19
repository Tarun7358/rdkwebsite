import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let badgeClass = 'status-badge';
  const norm = status.toLowerCase();
  
  if (
    norm === 'active' ||
    norm === 'paid' ||
    norm === 'hired' ||
    norm === 'done' ||
    norm === 'in progress' ||
    norm === 'interviewing'
  ) {
    badgeClass += ' status-active';
  } else if (
    norm === 'unpaid' ||
    norm === 'rejected' ||
    norm === 'open' ||
    norm === 'critical' ||
    norm === 'high'
  ) {
    badgeClass += ' status-open';
  } else {
    badgeClass += ' status-done';
  }

  return <span className={`${badgeClass} ${className}`}>{status}</span>;
};
