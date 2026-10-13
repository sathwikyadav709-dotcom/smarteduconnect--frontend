import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Delete', isDanger = true }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ color: isDanger ? '#ef4444' : '#f59e0b', flexShrink: 0 }}>
          <AlertTriangle size={28} />
        </div>
        <div style={{ color: '#334155', fontSize: '0.95rem' }}>
          {message}
        </div>
      </div>
      <div className="modal-footer" style={{ margin: '-24px', marginTop: '10px' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button 
          className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
