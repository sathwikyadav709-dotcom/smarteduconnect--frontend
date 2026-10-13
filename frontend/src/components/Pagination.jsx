import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
      <button
        className="btn btn-secondary btn-sm"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
      >
        <ChevronLeft size={16} />
        <span>Prev</span>
      </button>

      <span style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 8px' }}>
        Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        className="btn btn-secondary btn-sm"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
