import React, { ReactNode } from "react";

interface ModalConfirmProps {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onSave: () => void;
  cancelText?: string;
  saveText?: string;
  children?: ReactNode;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isOpen,
  title,
  onCancel,
  onSave,
  cancelText = "Cancelar",
  saveText = "Salvar",
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={onCancel}
            ></button>
          </div>

          <div className="modal-body">{children}</div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              {saveText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
