import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
        {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} style={{ color: 'white', marginLeft: 'auto', display: 'flex' }}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
