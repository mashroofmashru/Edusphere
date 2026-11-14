import React, { useEffect, useRef } from 'react';

/**
 * Shared modal shell: consistent backdrop, Esc to close, backdrop click to close,
 * dialog semantics and initial focus.
 */
const Modal = ({ onClose, children, maxWidth = 'max-w-2xl', className = '', label }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.activeElement;
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-fade-in outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, subtitle, onClose }) => (
  <div className="flex justify-between items-start gap-4 mb-6 border-b border-gray-100 pb-4">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
    >
      <i className="fas fa-times" aria-hidden="true"></i>
    </button>
  </div>
);

export default Modal;
