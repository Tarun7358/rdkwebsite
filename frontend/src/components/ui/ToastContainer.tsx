import React from 'react';
import { useAppStore } from '../../store/appStore';

export const ToastContainer: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts) ?? [];
  const removeToast = useAppStore((s) => s.removeToast);

  return (
    <div className="toast-container" id="toastContainer" style={{ zIndex: 9999 }}>
      {toasts.map((t) => {
        let borderCol = 'var(--blue)';
        if (t.type === 'success') borderCol = '#10B981';
        if (t.type === 'error') borderCol = '#EF4444';
        if (t.type === 'warning') borderCol = '#F59E0B';

        return (
          <div
            key={t.id}
            className="toast"
            style={{ borderLeftColor: borderCol, cursor: 'pointer' }}
            onClick={() => removeToast(t.id)}
          >
            <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>
              {t.type.toUpperCase()}:
            </span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};
