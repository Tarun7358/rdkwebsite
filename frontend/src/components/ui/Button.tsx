import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  let btnClass = 'btn';
  if (variant === 'primary') btnClass += ' btn-primary';
  if (variant === 'outline') btnClass += ' btn-outline';
  if (variant === 'ghost') btnClass += ' btn-ghost';

  return (
    <button
      className={`${btnClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
