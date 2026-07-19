import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {title && (
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              marginBottom: '1rem',
            }}
          >
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};
