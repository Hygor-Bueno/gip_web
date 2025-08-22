import React from 'react';

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      <style>{`
        .confirm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100dvh;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
          padding: 1rem;
        }

        .confirm-modal-container {
          background-color: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 30rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .confirm-modal-header {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .confirm-modal-title {
          margin: 0;
          font-size: 1.25rem;
        }

        .confirm-modal-body {
          padding: 1rem;
          font-size: 1rem;
        }

        .confirm-modal-body p {
          margin: 0;
        }

        .confirm-modal-footer {
          padding: 1rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
      `}</style>

      <div className="confirm-modal-overlay">
        <div className="confirm-modal-container">
          <div className="confirm-modal-header">
            <h5 className="confirm-modal-title">{title}</h5>
            <button className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="confirm-modal-body">
            <p>{message}</p>
          </div>

          <div className="confirm-modal-footer">
            <button title="Cancelar ação." className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button title="Confirmar ação" className="btn btn-primary" onClick={onConfirm}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
