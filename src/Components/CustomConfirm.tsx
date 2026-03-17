import React from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
}: ConfirmModalProps): JSX.Element {
  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 1050 
      }}
      onClick={onClose} // Fecha ao clicar no fundo (overlay)
    >
      <div 
        className="card shadow w-100" 
        style={{ maxWidth: '30rem' }}
        onClick={(e) => e.stopPropagation()} // Impede que o clique no modal feche ele
      >
        {/* Header */}
        <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold">{title}</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose} 
            aria-label="Close"
          ></button>
        </div>

        {/* Body */}
        <div className="card-body py-4">
          <p className="mb-0 text-secondary">{message}</p>
        </div>

        {/* Footer */}
        <div className="card-footer d-flex justify-content-end gap-2 bg-white border-top py-3">
          <button 
            type="button"
            className="btn btn-light border px-4" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button"
            className="btn btn-primary px-4" 
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}